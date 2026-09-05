import { prisma } from './prisma';
import { crowdBTUpdate, crowdBTScore } from './crowdbt';
import { Settings } from './settings';
import type { TableVisit, PairComparison } from '@prisma/client';

export type { TableVisit, PairComparison };

const THEME_PRIOR_WEIGHT = 3;
const THEME_PRIOR_SCORE = 2.0;

export type JudgeWithVisit = {
	id: string;
	name: string;
	email: string;
	role: string | null;
	judgeTrack: string | null;
	manualMode: boolean;
	_count: { tableVisits: number };
	tableVisits: (TableVisit & {
		project: {
			name: string;
			tableNumber: string | null;
		};
	})[];
};

export const Judging = {
	assignNextTable: async (judgeId: string): Promise<TableVisit | null> => {
		const existing = await prisma.tableVisit.findFirst({
			where: { judgeId, status: { in: ['assigned', 'active'] } },
			orderBy: { sequence: 'asc' }
		});
		if (existing) return existing;

		const [judge, allProjects, maxJudgesPerTeam, visitCountRows, compCountRows, myVisits] =
			await Promise.all([
				prisma.user.findUnique({ where: { id: judgeId }, select: { judgeTrack: true, manualMode: true } }),
				prisma.project.findMany({
					where: { tableNumber: { not: null } },
					include: { Track: { select: { name: true } } },
					orderBy: { tableNumber: 'asc' }
				}),
				Settings.getMaxJudgesPerTeam(),
				prisma.tableVisit.groupBy({ by: ['projectId'], _count: { id: true } }),
				prisma.crowdBTState.groupBy({ by: ['projectId'], _sum: { comparisonCount: true } }),
				prisma.tableVisit.findMany({
					where: { judgeId },
					select: { projectId: true, sequence: true, status: true },
					orderBy: { sequence: 'desc' }
				})
			]);

		if (judge?.manualMode) return null;

		const judgeTrack = judge?.judgeTrack ?? null;
		const visitedIds = new Set(myVisits.map((v) => v.projectId));
		const visitCountMap = new Map(visitCountRows.map((r) => [r.projectId, r._count.id]));
		const compCountMap = new Map(
			compCountRows.map((r) => [r.projectId, r._sum.comparisonCount ?? 0])
		);
		const maxCapacity = maxJudgesPerTeam ?? Infinity;

		const unvisited = allProjects.filter((p) => {
			if (visitedIds.has(p.id)) return false;
			const isTrackMatch = judgeTrack !== null && p.Track?.name === judgeTrack;
			if (isTrackMatch) return true;
			return (visitCountMap.get(p.id) ?? 0) < maxCapacity;
		});

		if (unvisited.length === 0) return null;

		const lastVisit = myVisits[0];
		const lastTableNumber = lastVisit
			? (allProjects.find((p) => p.id === lastVisit.projectId)?.tableNumber ?? null)
			: null;
		const lastNum = lastTableNumber !== null ? parseInt(lastTableNumber, 10) : null;

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
			if (judgeTrack !== null && a.isTrackMatch !== b.isTrackMatch)
				return a.isTrackMatch ? -1 : 1;
			if (a.visitCount !== b.visitCount) return a.visitCount - b.visitCount;
			if (a.distance !== b.distance) return a.distance - b.distance;
			return a.compCount - b.compCount;
		});

		const candidate = scored[0];
		if (!candidate) return null;

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

	submitFeedback: async (
		judgeId: string,
		visitId: string,
		feedback: string,
		optOutCriterionIds: string[] = [],
		trackFitScore: number | null = null,
		themeAttempted: boolean | null = null,
		themeScore: number | null = null
	): Promise<{ nextVisit: TableVisit | null; comparison: PairComparison | null }> => {
		let nextVisit: TableVisit | null = null;
		let comparison: PairComparison | null = null;

		await prisma.$transaction(async (tx) => {
			const current = await tx.tableVisit.findUnique({ where: { id: visitId } });
			if (!current || current.judgeId !== judgeId) {
				throw new Error('TableVisit not found or does not belong to this judge');
			}

			await tx.tableVisit.update({
				where: { id: visitId },
				data: {
					status: 'completed',
					completedAt: new Date(),
					feedback,
					trackFitScore,
					themeAttempted,
					themeScore: themeAttempted ? themeScore : null
				}
			});

			if (optOutCriterionIds.length > 0) {
				await tx.visitOptOut.createMany({
					data: optOutCriterionIds.map((criterionId) => ({ visitId, criterionId })),
					skipDuplicates: true
				});
			}

			if (current.sequence > 1) {
				const prev = await tx.tableVisit.findFirst({
					where: { judgeId, sequence: current.sequence - 1 }
				});

				if (prev) {
					comparison = await tx.pairComparison.create({
						data: {
							judgeId,
							projectAId: prev.projectId,
							projectBId: current.projectId,
							comment: ''
						}
					});

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

		nextVisit = await Judging.assignNextTable(judgeId);

		return { nextVisit, comparison };
	},

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

	submitComparison: async (
		judgeId: string,
		comparisonId: string,
		results: { criterionId: string; winner: 'A' | 'B' | 'OPT_OUT_A' | 'OPT_OUT_B' }[],
		comment: string
	) => {
		return await prisma.$transaction(async (tx) => {
			const comparison = await tx.pairComparison.findUnique({
				where: { id: comparisonId }
			});
			if (!comparison || comparison.judgeId !== judgeId) {
				throw new Error('PairComparison not found or does not belong to this judge');
			}

			const { projectAId, projectBId } = comparison;

			await tx.pairCriterionResult.createMany({
				data: results.map((r) => ({
					pairComparisonId: comparisonId,
					criterionId: r.criterionId,
					winner: r.winner
				}))
			});

			for (const result of results) {
				if (result.winner !== 'A' && result.winner !== 'B') continue;

				const winnerId = result.winner === 'A' ? projectAId : projectBId;
				const loserId = result.winner === 'A' ? projectBId : projectAId;

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

			return await tx.pairComparison.update({
				where: { id: comparisonId },
				data: { comment },
				include: { results: true }
			});
		});
	},

	getAllProjectScores: async () => {
		const [projects, allCriteria, allComparisons, allVisits] = await Promise.all([
			prisma.project.findMany({
				include: { Track: true, crowdBTStates: true }
			}),
			prisma.judgingCriterion.findMany({ orderBy: { order: 'asc' } }),
			prisma.pairComparison.findMany({ select: { projectAId: true, projectBId: true } }),
			prisma.tableVisit.findMany({
				select: { projectId: true, trackFitScore: true, themeAttempted: true, themeScore: true }
			})
		]);

		const optionalCriteria = allCriteria.filter((c) => c.optional);
		const coreCriteria = allCriteria.filter((c) => !c.optional);

		const compCountMap = new Map<string, number>();
		for (const c of allComparisons) {
			compCountMap.set(c.projectAId, (compCountMap.get(c.projectAId) ?? 0) + 1);
			compCountMap.set(c.projectBId, (compCountMap.get(c.projectBId) ?? 0) + 1);
		}

		type ThemeAgg = { yesCount: number; totalVotes: number; scoreSum: number; scoreCount: number };
		const trackFitMap = new Map<string, { sum: number; count: number }>();
		const themeMap = new Map<string, ThemeAgg>();
		for (const v of allVisits) {
			if (v.trackFitScore != null) {
				const t = trackFitMap.get(v.projectId) ?? { sum: 0, count: 0 };
				t.sum += v.trackFitScore;
				t.count += 1;
				trackFitMap.set(v.projectId, t);
			}
			if (v.themeAttempted != null) {
				const t = themeMap.get(v.projectId) ?? { yesCount: 0, totalVotes: 0, scoreSum: 0, scoreCount: 0 };
				t.totalVotes += 1;
				if (v.themeAttempted) {
					t.yesCount += 1;
					if (v.themeScore != null) {
						t.scoreSum += v.themeScore;
						t.scoreCount += 1;
					}
				}
				themeMap.set(v.projectId, t);
			}
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

			const trackFit = trackFitMap.get(p.id);
			const theme = themeMap.get(p.id);

			return {
				id: p.id,
				name: p.name,
				track: p.Track?.name ?? p.track ?? 'General',
				tableNumber: p.tableNumber,
				coreScore,
				optionalScores,
				judgementCount: compCountMap.get(p.id) ?? 0,
				trackFitScore: trackFit ? trackFit.sum / trackFit.count : null,
				themeAttemptedCount: theme?.yesCount ?? 0,
				themeTotalVisits: theme?.totalVotes ?? 0,
				themeScore:
					theme && theme.totalVotes > 0
						? (theme.scoreSum + THEME_PRIOR_WEIGHT * THEME_PRIOR_SCORE) /
							(theme.totalVotes + THEME_PRIOR_WEIGHT)
						: null
			};
		});

		const grouped: Record<string, typeof calculated> = {};
		for (const p of calculated) {
			const track = p.track || 'General';
			if (!grouped[track]) grouped[track] = [];
			grouped[track].push(p);
		}
		for (const track in grouped) {
			grouped[track].sort((a, b) => b.coreScore - a.coreScore);
		}

		const theme = calculated
			.filter((p) => p.themeAttemptedCount > 0)
			.sort((a, b) => (b.themeScore ?? 0) - (a.themeScore ?? 0));

		return { results: grouped, optionalCriteria, theme };
	},

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

	clearAllScores: async () => {
		return await prisma.$transaction([
			prisma.pairCriterionResult.deleteMany({}),
			prisma.pairComparison.deleteMany({}),
			prisma.crowdBTState.deleteMany({}),
			prisma.visitOptOut.deleteMany({}),
			prisma.tableVisit.deleteMany({})
		]);
	},

	setManualMode: async (userId: string, manualMode: boolean) => {
		return await prisma.user.update({
			where: { id: userId },
			data: { manualMode }
		});
	}
};
