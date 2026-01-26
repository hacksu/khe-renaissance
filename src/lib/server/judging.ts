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
        // 0. Check for existing 'assigned' projects (Forced assignments)
        const existingAssignment = await prisma.judgeAssignment.findFirst({
            where: {
                userId,
                status: 'assigned'
            },
            orderBy: {
                project: { tableNumber: 'asc' } // Optional: Do them in order
            }
        });

        if (existingAssignment) {
            return existingAssignment;
        }

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
    /**
     * Get aggregated scores for all projects (Leaderboard), grouped by track.
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

        // Calculate scores
        const calculated = projects.map(p => {
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
        });

        // Group by track
        const grouped: Record<string, typeof calculated> = {};

        for (const p of calculated) {
            const track = p.track || "General";
            if (!grouped[track]) grouped[track] = [];
            grouped[track].push(p);
        }

        // Sort each track
        for (const track in grouped) {
            grouped[track].sort((a, b) => Number(b.averageScore) - Number(a.averageScore));
        }

        // Sort tracks alphabetically (optional, but good for consistency)
        // actually returning a sorted object is tricky in JS, but we can return entries
        // or just let frontend handle track order.
        // Let's return the Record and let frontend Iterate.

        return grouped;
    },

    /**
     * Clear all judgements and assignments.
     */
    clearAllScores: async () => {
        return await prisma.$transaction([
            prisma.judgement.deleteMany({}),
            prisma.judgeAssignment.deleteMany({})
        ]);
    },

    /**
     * Get all users who are capable of being judges (Staff role).
     */
    getAllJudges: async () => {
        // Fetch both 'staff' and 'judge' roles to support future OTP-authenticated judges
        return await prisma.user.findMany({
            where: {
                role: { in: ['staff', 'judge'] }
            },
            include: {
                judgeAssignments: {
                    include: {
                        project: true
                    },
                    where: {
                        status: 'assigned'
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
    },

    /**
     * Assign a judge to specific teams by table number string.
     * @param userId The ID of the judge (User)
     * @param tableNumbersString Comma separated string of table numbers (e.g. "1, 2, 5-10")
     */
    assignJudgeToTeams: async (userId: string, tableNumbersString: string) => {
        // 1. Parse table numbers
        const parts = tableNumbersString.split(',').map(s => s.trim()).filter(s => s);
        const tableNumbers: string[] = [];

        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(n => parseInt(n));
                if (!isNaN(start) && !isNaN(end)) {
                    for (let i = start; i <= end; i++) {
                        tableNumbers.push(i.toString());
                    }
                }
            } else {
                tableNumbers.push(part);
            }
        }

        if (tableNumbers.length === 0) {
            // If empty, maybe we want to clear assignments? 
            // For now, let's treat it as *setting* the assignments to ONLY these.
            // So we delete existing assigned ones and create new ones.
        }

        // 2. Find projects
        const projects = await prisma.project.findMany({
            where: {
                tableNumber: { in: tableNumbers }
            }
        });

        // 3. Update Assignments
        // Strategy: We want the user to be assigned *exactly* these.
        // But maybe they have completed some? We shouldn't delete completed ones.
        // Let's delete all 'assigned' ones, and create new 'assigned' ones for the requested list.
        // If they already have a 'completed' assignment for a project, we skip it?
        // Or do we force re-assignment? Usually completed is final.

        return await prisma.$transaction(async (tx) => {
            // Delete existing 'assigned' tasks for this user
            await tx.judgeAssignment.deleteMany({
                where: {
                    userId,
                    status: 'assigned'
                }
            });

            // Create new assignments
            // Filter out projects they might have already completed?
            const completed = await tx.judgeAssignment.findMany({
                where: {
                    userId,
                    projectId: { in: projects.map(p => p.id) },
                    status: 'completed'
                },
                select: { projectId: true }
            });

            const completedIds = new Set(completed.map(c => c.projectId));

            const toCreate = projects.filter(p => !completedIds.has(p.id));

            if (toCreate.length > 0) {
                await tx.judgeAssignment.createMany({
                    data: toCreate.map(p => ({
                        userId,
                        projectId: p.id,
                        status: 'assigned'
                    }))
                });
            }
        });
    },

    /**
     * Get all projects with table numbers for UI selection.
     */
    getAllProjectsWithTables: async () => {
        return await prisma.project.findMany({
            where: {
                tableNumber: { not: null }
            },
            select: {
                id: true,
                name: true,
                tableNumber: true
            },
            orderBy: {
                // ordering by table number string might be weird ("1", "10", "2"), but okay for now
                tableNumber: 'asc'
            }
        });
    }
};
