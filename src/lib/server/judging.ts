import { prisma } from '$lib/server/prisma';

export const Judging = {
    /**
     * Get all judge assignments for a user.
     */
    getJudgeAssignments: async (userId: string) => {
        const assignments = await prisma.judgeAssignment.findMany({
            where: { userId },
            include: {
                project: {
                    include: { Track: true }
                }
            },
            orderBy: [
                { status: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        return assignments.map(a => ({
            ...a,
            project: {
                ...a.project,
                track: a.project.Track?.name || a.project.track
            }
        }));
    },

    /**
     * Find and assign the next optimal project for a user to judge.
     */
    assignNextProject: async (userId: string) => {
        // 1. Get IDs of projects user has already touched
        const userHistory = await prisma.judgeAssignment.findMany({
            where: { userId },
            select: { projectId: true }
        });
        const excludedIds = userHistory.map(h => h.projectId);

        // 2. Find optimal project
        const candidates = await prisma.project.findMany({
            where: { id: { notIn: excludedIds } },
            include: {
                _count: {
                    select: {
                        judgements: true,
                        judgeAssignments: { where: { status: 'assigned' } }
                    }
                }
            },
            take: 50
        });

        // Sort: Least judgements -> Least active assignments
        candidates.sort((a, b) => {
            if (a._count.judgements !== b._count.judgements) {
                return a._count.judgements - b._count.judgements;
            }
            return a._count.judgeAssignments - b._count.judgeAssignments;
        });

        const candidate = candidates[0];

        if (!candidate) {
            return null;
        }

        // 3. Create Assignment
        const assignment = await prisma.judgeAssignment.create({
            data: {
                userId,
                projectId: candidate.id,
                status: 'assigned'
            }
        });

        return assignment;
    },

    /**
     * Get a specific assignment/project details for judging.
     */
    getProjectForJudging: async (projectId: string) => {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { Track: true }
        });

        if (!project) return null;

        const criteria = await prisma.judgingCriterion.findMany({
            orderBy: { order: 'asc' }
        });

        return {
            project: {
                ...project,
                track: project.Track?.name || project.track
            },
            criteria
        };
    },

    /**
     * Submit scores for a project.
     */
    submitScore: async (userId: string, projectId: string, scores: { criterionId: string, score: number }[]) => {
        return await prisma.judgement.upsert({
            where: {
                userId_projectId: { userId, projectId }
            },
            update: {
                scores: {
                    deleteMany: {},
                    create: scores
                }
            },
            create: {
                userId,
                projectId,
                scores: {
                    create: scores
                },
            }
        });
    },

    /**
     * Submit a comment and complete the assignment.
     */
    submitComment: async (userId: string, projectId: string, comment: string) => {
        // Update Judgement
        await prisma.judgement.update({
            where: {
                userId_projectId: { userId, projectId }
            },
            data: {
                comment: comment || null
            }
        });

        // Mark Assignment as Completed
        await prisma.judgeAssignment.update({
            where: {
                userId_projectId: { userId, projectId }
            },
            data: {
                status: 'completed'
            }
        });
    },

    /**
     * Get aggregated scores for all projects (Leaderboard).
     */
    getAllProjectScores: async () => {
        const projects = await prisma.project.findMany({
            include: {
                judgements: {
                    include: { scores: true }
                },
                Track: true
            }
        });

        return projects.map(p => {
            const totalScore = p.judgements.reduce((sum, j) => {
                return sum + j.scores.reduce((s, score) => s + score.score, 0);
            }, 0);

            const count = p.judgements.length;
            const average = count > 0 ? (totalScore / count).toFixed(2) : "0.00";

            return {
                id: p.id,
                name: p.name,
                track: p.Track?.name || p.track,
                tableNumber: p.tableNumber,
                judgementCount: count,
                totalScore,
                averageScore: average
            };
        }).sort((a, b) => Number(b.averageScore) - Number(a.averageScore));
    },

    /**
     * Clear all judgements and assignments.
     */
    clearAllScores: async () => {
        return await prisma.$transaction([
            prisma.judgement.deleteMany({}),
            prisma.judgeAssignment.deleteMany({})
        ]);
    }
};
