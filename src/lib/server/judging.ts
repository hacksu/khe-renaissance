import { prisma } from '$lib/server/prisma';
import { crowdBTUpdate, crowdBTScore } from '$lib/server/crowdbt';

export const Judging = {
	/**
	 * Upsert a CrowdBTState row with defaults alpha=1, beta=1 if it doesn't exist.
	 */
	getOrCreateCrowdBTState: async (projectId: string, criterionId: string) => {
		return await prisma.crowdBTState.upsert({
			where: { projectId_criterionId: { projectId, criterionId } },
			update: {},
			create: { projectId, criterionId, alpha: 1, beta: 1, comparisonCount: 0 }
		});
	},

	/**
	 * Sequential pair assignment for a judge.
	 */
	assignNextPair: async (judgeId: string) => {
		// 1. Check if judge already has an assigned pair
		const existing = await prisma.pairAssignment.findFirst({
			where: { judgeId, status: 'assigned' }
		});
		if (existing) return existing;

		// 2. Find all eligible projects (with a tableNumber)
		const projects = await prisma.project.findMany({
			where: { tableNumber: { not: null } },
			select: { id: true, tableNumber: true },
			orderBy: { tableNumber: 'asc' }
		});

		// 3. Find all pairs this judge has already been assigned
		const alreadyAssigned = await prisma.pairAssignment.findMany({
			where: { judgeId },
			select: { projectAId: true, projectBId: true }
		});

		const assignedSet = new Set(
			alreadyAssigned.map((a) => `${a.projectAId}:${a.projectBId}`)
		);

		// 4. Find first available pair (projectAId < projectBId) not yet assigned to this judge
		let candidateA: (typeof projects)[0] | null = null;
		let candidateB: (typeof projects)[0] | null = null;

		outer: for (let i = 0; i < projects.length; i++) {
			for (let j = i + 1; j < projects.length; j++) {
				const a = projects[i];
				const b = projects[j];
				const key = `${a.id}:${b.id}`;
				if (!assignedSet.has(key)) {
					candidateA = a;
					candidateB = b;
					break outer;
				}
			}
		}

		if (!candidateA || !candidateB) return null;

		// 5. Create and return the PairAssignment
		// Wrap in try/catch to handle concurrent inserts hitting the unique constraint
		try {
			return await prisma.pairAssignment.create({
				data: {
					judgeId,
					projectAId: candidateA.id,
					projectBId: candidateB.id,
					status: 'assigned'
				}
			});
		} catch (e: any) {
			if (e?.code === 'P2002') {
				// A concurrent request already created an assignment for this judge
				return await prisma.pairAssignment.findFirst({
					where: { judgeId, status: 'assigned' }
				});
			}
			throw e;
		}
	},

	/**
	 * Get a pair assignment with full details for the judging UI.
	 */
	getPairForJudging: async (pairAssignmentId: string, judgeId: string) => {
		const pairAssignment = await prisma.pairAssignment.findUnique({
			where: { id: pairAssignmentId },
			include: {
				projectA: { include: { Track: true } },
				projectB: { include: { Track: true } }
			}
		});

		if (!pairAssignment || pairAssignment.judgeId !== judgeId) return null;

		const criteria = await prisma.judgingCriterion.findMany({
			orderBy: { order: 'asc' }
		});

		// Get the judge's most recent completed PairComparison's comment
		const lastComparison = await prisma.pairComparison.findFirst({
			where: { judgeId },
			orderBy: { createdAt: 'desc' },
			select: { comment: true }
		});

		return {
			pairAssignment,
			criteria,
			previousComment: lastComparison?.comment ?? null
		};
	},

	/**
	 * Submit a pairwise comparison result.
	 */
	submitComparison: async (
		judgeId: string,
		pairAssignmentId: string,
		results: { criterionId: string; winner: 'A' | 'B' | 'OPT_OUT_A' | 'OPT_OUT_B' }[],
		comment: string
	) => {
		return await prisma.$transaction(async (tx) => {
			// 1. Get the PairAssignment and verify ownership
			const pairAssignment = await tx.pairAssignment.findUnique({
				where: { id: pairAssignmentId }
			});

			if (!pairAssignment || pairAssignment.judgeId !== judgeId) {
				throw new Error('PairAssignment not found or does not belong to this judge');
			}

			const { projectAId, projectBId } = pairAssignment;

			// 2. Create a PairComparison with comment and results
			const comparison = await tx.pairComparison.create({
				data: {
					judgeId,
					projectAId,
					projectBId,
					comment,
					results: {
						create: results.map((r) => ({
							criterionId: r.criterionId,
							winner: r.winner
						}))
					}
				},
				include: { results: true }
			});

			// 3. Update CrowdBT state for non-opt-out results
			for (const result of results) {
				if (result.winner !== 'A' && result.winner !== 'B') continue;

				const winnerId = result.winner === 'A' ? projectAId : projectBId;
				const loserId = result.winner === 'A' ? projectBId : projectAId;

				// Upsert CrowdBTState for winner and loser (ensure rows exist)
				await Promise.all([
					tx.crowdBTState.upsert({
						where: { projectId_criterionId: { projectId: winnerId, criterionId: result.criterionId } },
						update: {},
						create: { projectId: winnerId, criterionId: result.criterionId, alpha: 1, beta: 1, comparisonCount: 0 }
					}),
					tx.crowdBTState.upsert({
						where: { projectId_criterionId: { projectId: loserId, criterionId: result.criterionId } },
						update: {},
						create: { projectId: loserId, criterionId: result.criterionId, alpha: 1, beta: 1, comparisonCount: 0 }
					})
				]);

				// Re-read fresh values inside the transaction to avoid using stale upsert results
				const [winnerState, loserState] = await Promise.all([
					tx.crowdBTState.findUniqueOrThrow({
						where: { projectId_criterionId: { projectId: winnerId, criterionId: result.criterionId } }
					}),
					tx.crowdBTState.findUniqueOrThrow({
						where: { projectId_criterionId: { projectId: loserId, criterionId: result.criterionId } }
					})
				]);

				const updated = crowdBTUpdate(
					{ alpha: winnerState.alpha, beta: winnerState.beta },
					{ alpha: loserState.alpha, beta: loserState.beta }
				);

				// Update both states and increment comparisonCount
				await Promise.all([
					tx.crowdBTState.update({
						where: { projectId_criterionId: { projectId: winnerId, criterionId: result.criterionId } },
						data: {
							alpha: updated.winner.alpha,
							beta: updated.winner.beta,
							comparisonCount: { increment: 1 }
						}
					}),
					tx.crowdBTState.update({
						where: { projectId_criterionId: { projectId: loserId, criterionId: result.criterionId } },
						data: {
							alpha: updated.loser.alpha,
							beta: updated.loser.beta,
							comparisonCount: { increment: 1 }
						}
					})
				]);
			}

			// 4. Mark the PairAssignment as completed
			await tx.pairAssignment.update({
				where: { id: pairAssignmentId },
				data: { status: 'completed', completedAt: new Date() }
			});

			return comparison;
		});
	},

	/**
	 * Skip a pair assignment.
	 */
	skipPair: async (judgeId: string, pairAssignmentId: string, reason: string) => {
		return await prisma.pairAssignment.update({
			where: { id: pairAssignmentId, judgeId },
			data: { status: 'skipped', skipReason: reason, completedAt: new Date() }
		});
	},

	/**
	 * Get aggregated CrowdBT scores for all projects, grouped by track.
	 */
	getAllProjectScores: async () => {
		const [projects, allCriteria] = await Promise.all([
			prisma.project.findMany({
				include: {
					Track: true,
					crowdBTStates: true
				}
			}),
			prisma.judgingCriterion.findMany({
				orderBy: { order: 'asc' }
			})
		]);

		// For opt-outable criteria, find projects that have ONLY opt-out results
		const optOutCriteria = allCriteria.filter((c) => c.allowOptOut);

		// Get all PairCriterionResults for opt-out criteria
		const optOutResults = await prisma.pairCriterionResult.findMany({
			where: {
				criterionId: { in: optOutCriteria.map((c) => c.id) }
			},
			select: { criterionId: true, winner: true, pairComparison: { select: { projectAId: true, projectBId: true } } }
		});

		// For each opt-out criterion, build a set of project IDs that have at least one non-opt-out result
		const hasNonOptOut: Map<string, Set<string>> = new Map();
		for (const criterion of optOutCriteria) {
			hasNonOptOut.set(criterion.id, new Set());
		}

		for (const result of optOutResults) {
			if (result.winner === 'A' || result.winner === 'B') {
				const set = hasNonOptOut.get(result.criterionId);
				if (set) {
					set.add(result.pairComparison.projectAId);
					set.add(result.pairComparison.projectBId);
				}
			}
		}

		// Map projects to scores
		const calculated = projects.map((p) => {
			const criterionScores: Record<string, number> = {};
			let totalScore = 0;

			for (const state of p.crowdBTStates) {
				const score = crowdBTScore(state.alpha, state.beta);
				criterionScores[state.criterionId] = score;
				totalScore += score;
			}

			return {
				id: p.id,
				name: p.name,
				track: p.Track?.name ?? p.track ?? 'General',
				tableNumber: p.tableNumber,
				totalScore,
				criterionScores
			};
		});

		// Group by track and sort by totalScore descending
		const grouped: Record<string, typeof calculated> = {};
		for (const p of calculated) {
			const track = p.track || 'General';
			if (!grouped[track]) grouped[track] = [];
			grouped[track].push(p);
		}

		for (const track in grouped) {
			grouped[track].sort((a, b) => b.totalScore - a.totalScore);
		}

		// Per-opt-out-criterion rankings (excluding projects with only opt-out results)
		const optOutRankings: Record<string, typeof calculated> = {};
		for (const criterion of optOutCriteria) {
			const nonOptOutProjects = hasNonOptOut.get(criterion.id);
			const eligible = calculated
				.filter((p) => nonOptOutProjects?.has(p.id))
				.sort((a, b) => (b.criterionScores[criterion.id] ?? 0) - (a.criterionScores[criterion.id] ?? 0));
			optOutRankings[criterion.id] = eligible;
		}

		return {
			results: grouped,
			criteria: allCriteria,
			optOutRankings
		};
	},

	/**
	 * Get all users with role 'judge', with assignment counts and current pair.
	 */
	getAllJudges: async () => {
		return await prisma.user.findMany({
			where: { role: 'judge' },
			include: {
				pairAssignments: {
					where: { status: 'assigned' },
					include: {
						projectA: true,
						projectB: true
					},
					take: 1,
					orderBy: { createdAt: 'desc' }
				},
				_count: {
					select: {
						pairAssignments: { where: { status: 'completed' } }
					}
				}
			},
			orderBy: { name: 'asc' }
		});
	},

	/**
	 * Clear all PairComparisons, PairAssignments, and CrowdBTStates.
	 */
	clearAllScores: async () => {
		return await prisma.$transaction([
			prisma.pairComparison.deleteMany({}),
			prisma.pairAssignment.deleteMany({}),
			prisma.crowdBTState.deleteMany({})
		]);
	}
};
