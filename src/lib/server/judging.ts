import { prisma } from '$lib/server/prisma';
import { crowdBTUpdate, crowdBTScore } from '$lib/server/crowdbt';
import { Settings } from '$lib/server/settings';
import type { TableVisit, PairComparison } from '@prisma/client';

export type { TableVisit, PairComparison };

export type JudgeWithVisit = {
	id: string;
	name: string;
	email: string;
	role: string | null;
	judgeTrack: string | null;
	curve: number;
	_count: { tableVisits: number };
	tableVisits: (TableVisit & {
		project: {
			name: string;
			tableNumber: string | null;
		};
	})[];
};

export const Judging = {
	/**
	 * Assign the next table for a judge to visit.
	 * Returns an existing assigned/active visit if one exists, otherwise picks
	 * the least-judged unvisited project and creates a new TableVisit.
	 */
	assignNextTable: async (judgeId: string): Promise<TableVisit | null> => {
		// 1. Return existing assigned/active visit if present
		const existing = await prisma.tableVisit.findFirst({
			where: { judgeId, status: { in: ['assigned', 'active'] } },
			orderBy: { sequence: 'asc' }
		});
		if (existing) return existing;

		// 2. Load everything needed for scoring in parallel
		const [judge, allProjects, maxJudgesPerTeam, visitCountRows, compCountRows, myVisits] =
			await Promise.all([
				prisma.user.findUnique({ where: { id: judgeId }, select: { judgeTrack: true } }),
				prisma.project.findMany({
					where: { tableNumber: { not: null } },
					include: { Track: { select: { name: true } } },
					orderBy: { tableNumber: 'asc' }
				}),
				Settings.getMaxJudgesPerTeam(),
				prisma.tableVisit.groupBy({ by: ['projectId'], _count: { id: true } }),
				// Sum of comparisonCount across criteria per project — proxy for CrowdBT info already gained
				prisma.crowdBTState.groupBy({ by: ['projectId'], _sum: { comparisonCount: true } }),
				prisma.tableVisit.findMany({
					where: { judgeId },
					select: { projectId: true, sequence: true, status: true },
					orderBy: { sequence: 'desc' }
				})
			]);

		const judgeTrack = judge?.judgeTrack ?? null;
		const visitedIds = new Set(myVisits.map((v) => v.projectId));
		const visitCountMap = new Map(visitCountRows.map((r) => [r.projectId, r._count.id]));
		const compCountMap = new Map(
			compCountRows.map((r) => [r.projectId, r._sum.comparisonCount ?? 0])
		);
		const maxCapacity = maxJudgesPerTeam ?? Infinity;

		// 3. Eligible candidates: unvisited, within capacity (track judges bypass capacity for their track)
		const unvisited = allProjects.filter((p) => {
			if (visitedIds.has(p.id)) return false;
			const isTrackMatch = judgeTrack !== null && p.Track?.name === judgeTrack;
			// Track judges always allowed on matching track projects regardless of capacity
			if (isTrackMatch) return true;
			return (visitCountMap.get(p.id) ?? 0) < maxCapacity;
		});

		if (unvisited.length === 0) return null;

		// 4. Proximity: last visited table number for walking-distance scoring
		const lastVisit = myVisits[0];
		const lastTableNumber = lastVisit
			? (allProjects.find((p) => p.id === lastVisit.projectId)?.tableNumber ?? null)
			: null;
		const lastNum = lastTableNumber !== null ? parseInt(lastTableNumber, 10) : null;

		// 5. Score and sort candidates
		const scored = unvisited.map((p) => {
			const isTrackMatch = judgeTrack !== null && p.Track?.name === judgeTrack;
			const tableNum = parseInt(p.tableNumber!, 10);
			const distance =
				lastNum !== null && !isNaN(tableNum) && !isNaN(lastNum)
					? Math.abs(tableNum - lastNum)
					: 9999;
			return {
				p,
				isTrackMatch,
				visitCount: visitCountMap.get(p.id) ?? 0,
				distance,
				compCount: compCountMap.get(p.id) ?? 0
			};
		});

		scored.sort((a, b) => {
			// 1. Track judges must cover their track first
			if (judgeTrack !== null && a.isTrackMatch !== b.isTrackMatch)
				return a.isTrackMatch ? -1 : 1;
			// 2. Equalise judge count per table (primary goal)
			if (a.visitCount !== b.visitCount) return a.visitCount - b.visitCount;
			// 3. Minimise walking distance
			if (a.distance !== b.distance) return a.distance - b.distance;
			// 4. Maximise CrowdBT information gain (fewer comparisons = higher uncertainty)
			return a.compCount - b.compCount;
		});

		const candidate = scored[0];
		if (!candidate) return null;

		// 6. Create the next TableVisit
		const maxSeqRecord = await prisma.tableVisit.aggregate({
			where: { judgeId },
			_max: { sequence: true }
		});
		const maxSeq = maxSeqRecord._max.sequence ?? 0;

		return await prisma.tableVisit.create({
			data: {
				judgeId,
				projectId: candidate.p.id,
				sequence: maxSeq + 1,
				status: 'assigned'
			}
		});
	},

	/**
	 * Mark a TableVisit as active (judge has arrived at the table).
	 */
	startJudging: async (judgeId: string, visitId: string): Promise<TableVisit> => {
		const visit = await prisma.tableVisit.findUnique({ where: { id: visitId } });
		if (!visit || visit.judgeId !== judgeId) {
			throw new Error('TableVisit not found or does not belong to this judge');
		}
		return await prisma.tableVisit.update({
			where: { id: visitId },
			data: { status: 'active', startedAt: new Date() }
		});
	},

	/**
	 * Get the active visit with full project/track details and judging criteria.
	 */
	getActiveVisit: async (judgeId: string, visitId: string) => {
		const visit = await prisma.tableVisit.findUnique({
			where: { id: visitId },
			include: {
				project: { include: { Track: true } }
			}
		});
		if (!visit || visit.judgeId !== judgeId) {
			throw new Error('TableVisit not found or does not belong to this judge');
		}
		const criteria = await prisma.judgingCriterion.findMany({
			orderBy: { order: 'asc' }
		});
		return { visit, criteria };
	},

	/**
	 * Submit feedback for a completed table visit and automatically create
	 * a pairwise comparison with the previous table.
	 * optOutCriterionIds: criteria the judge determined this team did not attempt.
	 */
	submitFeedback: async (
		judgeId: string,
		visitId: string,
		feedback: string,
		optOutCriterionIds: string[] = []
	): Promise<{ nextVisit: TableVisit | null; comparison: PairComparison | null }> => {
		let nextVisit: TableVisit | null = null;
		let comparison: PairComparison | null = null;

		await prisma.$transaction(async (tx) => {
			// 1. Get the current visit and verify ownership
			const current = await tx.tableVisit.findUnique({ where: { id: visitId } });
			if (!current || current.judgeId !== judgeId) {
				throw new Error('TableVisit not found or does not belong to this judge');
			}

			// Mark as completed
			await tx.tableVisit.update({
				where: { id: visitId },
				data: { status: 'completed', completedAt: new Date(), feedback }
			});

			// Save opt-out records for optional criteria this team did not attempt
			if (optOutCriterionIds.length > 0) {
				await tx.visitOptOut.createMany({
					data: optOutCriterionIds.map((criterionId) => ({ visitId, criterionId })),
					skipDuplicates: true
				});
			}

			// 2. Get the previous completed visit (sequence = current.sequence - 1)
			if (current.sequence > 1) {
				const prev = await tx.tableVisit.findFirst({
					where: { judgeId, sequence: current.sequence - 1 }
				});

				if (prev) {
					// a. Create a PairComparison
					comparison = await tx.pairComparison.create({
						data: {
							judgeId,
							projectAId: prev.projectId,
							projectBId: current.projectId,
							comment: ''
						}
					});

					// b. Upsert CrowdBTState rows for both projects × all criteria
					const criteria = await tx.judgingCriterion.findMany({ select: { id: true } });
					const projectIds = [prev.projectId, current.projectId];

					for (const projectId of projectIds) {
						for (const criterion of criteria) {
							await tx.crowdBTState.upsert({
								where: {
									projectId_criterionId: { projectId, criterionId: criterion.id }
								},
								update: {},
								create: { projectId, criterionId: criterion.id, alpha: 1, beta: 1, comparisonCount: 0 }
							});
						}
					}
				}
			}
		});

		// 3. Assign next table (outside transaction to avoid nesting issues)
		nextVisit = await Judging.assignNextTable(judgeId);

		return { nextVisit, comparison };
	},

	/**
	 * Get a PairComparison with full project/track details and judging criteria.
	 * Criteria where either project opted out are excluded from the list.
	 */
	getComparison: async (judgeId: string, comparisonId: string) => {
		const comparison = await prisma.pairComparison.findUnique({
			where: { id: comparisonId },
			include: {
				projectA: { include: { Track: true } },
				projectB: { include: { Track: true } }
			}
		});
		if (!comparison || comparison.judgeId !== judgeId) {
			throw new Error('PairComparison not found or does not belong to this judge');
		}

		// Load opt-outs from both visits (same judge, respective projects)
		const [visitA, visitB] = await Promise.all([
			prisma.tableVisit.findUnique({
				where: { judgeId_projectId: { judgeId, projectId: comparison.projectAId } },
				include: { optOuts: true }
			}),
			prisma.tableVisit.findUnique({
				where: { judgeId_projectId: { judgeId, projectId: comparison.projectBId } },
				include: { optOuts: true }
			})
		]);

		const optOutIds = new Set([
			...(visitA?.optOuts.map((o) => o.criterionId) ?? []),
			...(visitB?.optOuts.map((o) => o.criterionId) ?? [])
		]);

		const allCriteria = await prisma.judgingCriterion.findMany({ orderBy: { order: 'asc' } });
		const criteria = allCriteria.filter((c) => !optOutIds.has(c.id));

		return { comparison, criteria };
	},

	/**
	 * Submit a pairwise comparison result.
	 */
	submitComparison: async (
		judgeId: string,
		comparisonId: string,
		results: { criterionId: string; winner: 'A' | 'B' | 'OPT_OUT_A' | 'OPT_OUT_B' }[],
		comment: string
	) => {
		return await prisma.$transaction(async (tx) => {
			// 1. Get the PairComparison and verify ownership
			const comparison = await tx.pairComparison.findUnique({
				where: { id: comparisonId }
			});
			if (!comparison || comparison.judgeId !== judgeId) {
				throw new Error('PairComparison not found or does not belong to this judge');
			}

			const { projectAId, projectBId } = comparison;

			// 2. Create PairCriterionResults
			await tx.pairCriterionResult.createMany({
				data: results.map((r) => ({
					pairComparisonId: comparisonId,
					criterionId: r.criterionId,
					winner: r.winner
				}))
			});

			// 3. Update CrowdBT state for non-opt-out results
			for (const result of results) {
				if (result.winner !== 'A' && result.winner !== 'B') continue;

				const winnerId = result.winner === 'A' ? projectAId : projectBId;
				const loserId = result.winner === 'A' ? projectBId : projectAId;

				// Upsert CrowdBTState for winner and loser (ensure rows exist)
				await Promise.all([
					tx.crowdBTState.upsert({
						where: {
							projectId_criterionId: { projectId: winnerId, criterionId: result.criterionId }
						},
						update: {},
						create: {
							projectId: winnerId,
							criterionId: result.criterionId,
							alpha: 1,
							beta: 1,
							comparisonCount: 0
						}
					}),
					tx.crowdBTState.upsert({
						where: {
							projectId_criterionId: { projectId: loserId, criterionId: result.criterionId }
						},
						update: {},
						create: {
							projectId: loserId,
							criterionId: result.criterionId,
							alpha: 1,
							beta: 1,
							comparisonCount: 0
						}
					})
				]);

				// Re-read fresh values inside the transaction
				const [winnerState, loserState] = await Promise.all([
					tx.crowdBTState.findUniqueOrThrow({
						where: {
							projectId_criterionId: { projectId: winnerId, criterionId: result.criterionId }
						}
					}),
					tx.crowdBTState.findUniqueOrThrow({
						where: {
							projectId_criterionId: { projectId: loserId, criterionId: result.criterionId }
						}
					})
				]);

				const updated = crowdBTUpdate(
					{ alpha: winnerState.alpha, beta: winnerState.beta },
					{ alpha: loserState.alpha, beta: loserState.beta }
				);

				// Update both states and increment comparisonCount
				await Promise.all([
					tx.crowdBTState.update({
						where: {
							projectId_criterionId: { projectId: winnerId, criterionId: result.criterionId }
						},
						data: {
							alpha: updated.winner.alpha,
							beta: updated.winner.beta,
							comparisonCount: { increment: 1 }
						}
					}),
					tx.crowdBTState.update({
						where: {
							projectId_criterionId: { projectId: loserId, criterionId: result.criterionId }
						},
						data: {
							alpha: updated.loser.alpha,
							beta: updated.loser.beta,
							comparisonCount: { increment: 1 }
						}
					})
				]);
			}

			// 4. Save comment on the PairComparison
			return await tx.pairComparison.update({
				where: { id: comparisonId },
				data: { comment },
				include: { results: true }
			});
		});
	},

	/**
	 * Get aggregated CrowdBT scores for all projects, grouped by track.
	 * Returns shape compatible with the admin scores UI.
	 */
	getAllProjectScores: async () => {
		const [projects, allCriteria, allComparisons] = await Promise.all([
			prisma.project.findMany({
				include: { Track: true, crowdBTStates: true }
			}),
			prisma.judgingCriterion.findMany({ orderBy: { order: 'asc' } }),
			prisma.pairComparison.findMany({ select: { projectAId: true, projectBId: true } })
		]);

		const optionalCriteria = allCriteria.filter((c) => c.allowOptOut);
		const coreCriteria = allCriteria.filter((c) => !c.allowOptOut);

		// Count comparisons per project (appears on either side)
		const compCountMap = new Map<string, number>();
		for (const c of allComparisons) {
			compCountMap.set(c.projectAId, (compCountMap.get(c.projectAId) ?? 0) + 1);
			compCountMap.set(c.projectBId, (compCountMap.get(c.projectBId) ?? 0) + 1);
		}

		const calculated = projects.map((p) => {
			const stateMap = new Map(p.crowdBTStates.map((s) => [s.criterionId, s]));

			let coreScore = 0;
			for (const c of coreCriteria) {
				const state = stateMap.get(c.id);
				if (state) coreScore += crowdBTScore(state.alpha, state.beta);
			}

			const optionalScores: Record<string, number | null> = {};
			for (const c of optionalCriteria) {
				const state = stateMap.get(c.id);
				optionalScores[c.id] = state ? crowdBTScore(state.alpha, state.beta) : null;
			}

			return {
				id: p.id,
				name: p.name,
				track: p.Track?.name ?? p.track ?? 'General',
				tableNumber: p.tableNumber,
				coreScore,
				optionalScores,
				judgementCount: compCountMap.get(p.id) ?? 0
			};
		});

		// Group by track, sort by coreScore descending
		const grouped: Record<string, typeof calculated> = {};
		for (const p of calculated) {
			const track = p.track || 'General';
			if (!grouped[track]) grouped[track] = [];
			grouped[track].push(p);
		}
		for (const track in grouped) {
			grouped[track].sort((a, b) => b.coreScore - a.coreScore);
		}

		return { results: grouped, optionalCriteria };
	},

	/**
	 * Get all users with role 'judge', with visit counts and current active visit.
	 */
	getAllJudges: async (): Promise<JudgeWithVisit[]> => {
		return (await prisma.user.findMany({
			where: { role: 'judge' },
			include: {
				tableVisits: {
					where: { status: 'active' },
					include: {
						project: { select: { name: true, tableNumber: true } }
					},
					take: 1
				},
				_count: {
					select: {
						tableVisits: { where: { status: 'completed' } }
					}
				}
			},
			orderBy: { name: 'asc' }
		})) as JudgeWithVisit[];
	},

	/**
	 * Clear all judging data: PairCriterionResults, PairComparisons, CrowdBTStates, TableVisits.
	 */
	clearAllScores: async () => {
		return await prisma.$transaction([
			prisma.pairCriterionResult.deleteMany({}),
			prisma.pairComparison.deleteMany({}),
			prisma.crowdBTState.deleteMany({}),
			prisma.visitOptOut.deleteMany({}),
			prisma.tableVisit.deleteMany({})
		]);
	},

	/**
	 * Update the curve value for a judge.
	 */
	updateJudgeCurve: async (userId: string, curve: number) => {
		return await prisma.user.update({
			where: { id: userId },
			data: { curve }
		});
	}
};
