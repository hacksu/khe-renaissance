import { prisma } from '$lib/server/prisma';
import { sendJudgeFeedbackEmail } from '$lib/server/email';
import { syncJudgingSheet } from '$lib/server/sheets';
import { Settings } from '$lib/server/settings';

export const Judging = {
    /**
     * Get all judge assignments for a user.
     */
    getJudgeAssignments: async (userId: string) => {
        const assignments = await prisma.judgeAssignment.findMany({
            where: { userId },
            include: {
                project: {
                    include: {
                        Track: true,
                        judgements: {
                            where: { userId },
                            select: { comment: true }
                        }
                    }
                }
            },
            orderBy: [
                { status: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        return assignments.map(a => ({
            ...a,
            comment: a.project.judgements[0]?.comment ?? null,
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
        const existingAssignment = await prisma.judgeAssignment.findFirst({
            where: { userId, status: 'assigned' },
            orderBy: { project: { tableNumber: 'asc' } }
        });
        if (existingAssignment) return existingAssignment;

        const manualCount = await prisma.judgeAssignment.count({ where: { userId, isManual: true } });
        if (manualCount > 0) return null;

        const [maxTables, goal] = await Promise.all([
            Settings.getMaxTablesPerJudge(),
            Settings.getMaxJudgesPerTeam()
        ]);

        if (maxTables !== null) {
            const seen = await prisma.judgeAssignment.count({
                where: { userId, status: { in: ['assigned', 'completed'] } }
            });
            if (seen >= maxTables) return null;
        }

        const [allProjects, userHistory] = await Promise.all([
            prisma.project.findMany({
                select: {
                    id: true,
                    tableNumber: true,
                    _count: {
                        select: {
                            judgements: true,
                            judgeAssignments: { where: { status: 'assigned' } }
                        }
                    }
                }
            }),
            prisma.judgeAssignment.findMany({
                where: { userId },
                select: { projectId: true, project: { select: { tableNumber: true } } },
                orderBy: { completedAt: 'desc' }
            })
        ]);

        const seenIds = new Set(userHistory.map(h => h.projectId));
        const lastTable = userHistory[0]?.project?.tableNumber ? parseInt(userHistory[0].project.tableNumber) : null;

        const unseen = allProjects.filter(p => !seenIds.has(p.id));
        if (unseen.length === 0) return null;

        const eligible = goal === null
            ? unseen
            : unseen.filter(p => p._count.judgements + p._count.judgeAssignments < goal);
        if (eligible.length === 0) return null;

        const minCount = Math.min(...eligible.map(p => p._count.judgements));
        const tier = eligible.filter(p => p._count.judgements === minCount);

        const unoccupied = tier.filter(p => p._count.judgeAssignments === 0);
        const pool = unoccupied.length > 0 ? unoccupied
            : eligible.filter(p => p._count.judgeAssignments === 0).length > 0
                ? eligible.filter(p => p._count.judgeAssignments === 0)
                : tier;

        let candidate: typeof pool[0];
        if (lastTable === null) {
            candidate = pool[Math.floor(Math.random() * pool.length)];
        } else {
            candidate = pool.reduce((best, p) => {
                if (p._count.judgements !== best._count.judgements)
                    return p._count.judgements < best._count.judgements ? p : best;
                const distP = Math.abs(parseInt(p.tableNumber ?? '0') - lastTable);
                const distB = Math.abs(parseInt(best.tableNumber ?? '0') - lastTable);
                return distP < distB ? p : best;
            });
        }

        return prisma.judgeAssignment.create({
            data: { userId, projectId: candidate.id, status: 'assigned', isManual: false }
        });
    },

    /**
     * Get a specific assignment/project details for judging.
     */
    /**
     * Get a specific assignment/project details for judging.
     */
    getProjectForJudging: async (projectId: string, userId?: string) => {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { Track: true }
        });

        if (!project) return null;

        const criteria = await prisma.judgingCriterion.findMany({
            orderBy: { order: 'asc' }
        });

        let judgement = null;
        if (userId) {
            judgement = await prisma.judgement.findUnique({
                where: { userId_projectId: { userId, projectId } },
                include: {
                    scores: true,
                    user: { select: { curve: true } }
                }
            });
        }

        return {
            project: {
                ...project,
                track: project.Track?.name || project.track
            },
            criteria,
            judgement
        };
    },

    /**
     * Submit scores for a project.
     */
    submitScore: async (userId: string, projectId: string, scores: { criterionId: string, score: number }[]) => {
        const judgement = await prisma.judgement.upsert({
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
        syncJudgingSheet().catch(console.error);
        return judgement;
    },

    /**
     * Skip a project assignment without counting it toward the project's judge allocation.
     */
    skipProject: async (userId: string, projectId: string) => {
        await prisma.judgeAssignment.update({
            where: { userId_projectId: { userId, projectId } },
            data: { status: 'skipped', completedAt: new Date() }
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

        await prisma.judgeAssignment.update({
            where: { userId_projectId: { userId, projectId } },
            data: { status: 'completed', completedAt: new Date() }
        });

        syncJudgingSheet().catch(console.error);
    },

    /**
     * Get aggregated scores for all projects (Leaderboard), grouped by track.
     */
    getAllProjectScores: async () => {
        const allCriteria = await prisma.judgingCriterion.findMany({
            orderBy: { order: 'asc' }
        });

        const optionalCriteria = allCriteria.filter(c => c.optional);

        const projects = await prisma.project.findMany({
            include: {
                judgements: {
                    include: {
                        scores: { include: { criterion: true } },
                        user: { select: { name: true, curve: true } }
                    }
                },
                Track: true
            }
        });

        const calculated = projects.map(p => {
            const judgementCount = p.judgements.length;

            const coreTotal = p.judgements.reduce((sum, j) => {
                const curve = j.user.curve || 0;
                const judgeCore = j.scores
                    .filter(s => !s.criterion.optional)
                    .reduce((s, score) => s + score.score + curve, 0);
                return sum + judgeCore;
            }, 0);
            const coreScore = judgementCount > 0 ? coreTotal / judgementCount : 0;

            const optionalScores: Record<string, number | null> = {};
            for (const criterion of optionalCriteria) {
                const scoringJudgements = p.judgements.filter(j =>
                    j.scores.some(s => s.criterionId === criterion.id)
                );
                if (scoringJudgements.length === 0) {
                    optionalScores[criterion.id] = null;
                } else {
                    const total = scoringJudgements.reduce((sum, j) => {
                        const curve = j.user.curve || 0;
                        const s = j.scores.find(s => s.criterionId === criterion.id);
                        return sum + (s ? s.score + curve : 0);
                    }, 0);
                    optionalScores[criterion.id] = total / scoringJudgements.length;
                }
            }

            const judgeBreakdowns = p.judgements.map(j => {
                const curve = j.user.curve || 0;
                return {
                    judgeName: j.user.name,
                    comment: j.comment ?? null,
                    scores: j.scores.map(s => ({
                        criterionId: s.criterionId,
                        criterionName: s.criterion.name,
                        isOptional: s.criterion.optional,
                        curvedScore: s.score + curve
                    }))
                };
            });

            return {
                id: p.id,
                name: p.name,
                track: p.Track?.name || p.track,
                tableNumber: p.tableNumber,
                judgementCount,
                coreScore,
                optionalScores,
                judgeBreakdowns
            };
        });

        // Group by track
        const grouped: Record<string, typeof calculated> = {};
        for (const p of calculated) {
            const track = p.track || "General";
            if (!grouped[track]) grouped[track] = [];
            grouped[track].push(p);
        }

        // Default sort: core score descending
        for (const track in grouped) {
            grouped[track].sort((a, b) => b.coreScore - a.coreScore);
        }

        return {
            results: grouped,
            optionalCriteria: optionalCriteria.map(c => ({
                id: c.id,
                slug: c.slug,
                name: c.name,
                maxScore: c.maxScore
            }))
        };
    },

    /**
     * Get all projects with detailed feedback for emailing.
     * Optionally filter by a single projectId.
     */
    getProjectsWithFeedback: async (projectId?: string) => {
        const whereClause = projectId ? { id: projectId } : {};

        const projects = await prisma.project.findMany({
            where: whereClause,
            include: {
                judgements: {
                    include: {
                        scores: {
                            include: { criterion: true }
                        },
                        user: { select: { curve: true } }
                    }
                },
                Track: true,
                members: {
                    include: { user: true }
                }
            }
        });

        return projects.map(p => {
            const feedbacks = p.judgements.map((j, index) => {
                const curve = j.user.curve || 0;
                const scores = j.scores.map(s => ({
                    name: s.criterion.name,
                    value: s.score + curve,
                    max: s.criterion.maxScore
                }));

                return {
                    judgeLabel: `Judge ${index + 1}`,
                    scores,
                    comment: j.comment
                };
            });

            // Get team emails
            const emails = p.members
                .map(m => m.email || m.user.email)
                .filter(e => e && e.trim().length > 0);

            return {
                id: p.id,
                name: p.name,
                emails,
                feedbacks
            };
        });
    },

    /**
     * Send feedback emails to a project team.
     */
    sendFeedbackEmailToProject: async (project: {
        name: string,
        emails: string[],
        feedbacks: {
            judgeLabel: string,
            scores: { name: string, value: number, max: number }[],
            comment: string | null
        }[]
    }) => {
        if (project.emails.length === 0) return;

        // Format Feedback
        let feedbackText = "";
        let feedbackHtml = "";

        if (project.feedbacks.length === 0) {
            feedbackText = "No feedback was recorded for this project.";
            feedbackHtml = "<p>No feedback was recorded for this project.</p>";
        } else {
            for (const feedback of project.feedbacks) {
                feedbackText += `\n${feedback.judgeLabel}:\n`;
                feedbackHtml += `<h3>${feedback.judgeLabel}</h3>`;

                // Scores
                feedbackText += "Scores:\n";
                feedbackHtml += "<h4>Scores</h4><ul>";
                for (const s of feedback.scores) {
                    feedbackText += `- ${s.name}: ${s.value}/${s.max}\n`;
                    feedbackHtml += `<li><strong>${s.name}</strong>: ${s.value}/${s.max}</li>`;
                }
                feedbackHtml += "</ul>";

                // Comment
                if (feedback.comment) {
                    feedbackText += `Comment: ${feedback.comment}\n`;
                    feedbackHtml += `<h4>Comment</h4><p>${feedback.comment}</p>`;
                }

                feedbackText += "\n--------------------------------\n";
                feedbackHtml += "<hr>";
            }
        }

        // Send to all members concurrently
        await Promise.all(project.emails.map(email =>
            sendJudgeFeedbackEmail(email, project.name, feedbackText, feedbackHtml)
        ));
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
        return await prisma.user.findMany({
            where: {
                role: 'judge'
            },
            include: {
                judgeAssignments: {
                    include: { project: true },
                    where: { status: 'assigned' },
                    orderBy: { startedAt: 'desc' }
                },
                _count: {
                    select: {
                        judgeAssignments: { where: { status: 'completed' } }
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
        }

        // 2. Find projects
        const projects = await prisma.project.findMany({
            where: {
                tableNumber: { in: tableNumbers }
            }
        });

        // 3. Update Assignments

        // Manual assignment implies we want these specific ones.
        return await prisma.$transaction(async (tx) => {
            // Delete existing 'assigned' tasks for this user
            await tx.judgeAssignment.deleteMany({
                where: {
                    userId,
                    status: 'assigned'
                }
            });

            // Reset 'skipped' for projects being explicitly re-assigned by admin
            await tx.judgeAssignment.deleteMany({
                where: {
                    userId,
                    status: 'skipped',
                    projectId: { in: projects.map(p => p.id) }
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
                        status: 'assigned',
                        isManual: true // MARK AS MANUAL
                    }))
                });
            }
        });
    },

    /**
     * Self-assign a judge to a specific table number.
     * This bypasses the manual check (or rather, creates a manual-like assignment).
     */
    assignJudgeToTable: async (userId: string, tableNumber: string) => {
        const project = await prisma.project.findFirst({
            where: { tableNumber }
        });

        if (!project) {
            throw new Error(`No project found at table ${tableNumber}`);
        }

        const maxTables = await Settings.getMaxTablesPerJudge();
        if (maxTables !== null) {
            const assignedCount = await prisma.judgeAssignment.count({
                where: { userId, status: { in: ['assigned', 'completed'] } }
            });
            if (assignedCount >= maxTables) {
                throw new Error('cap');
            }
        }

        const completed = await prisma.judgeAssignment.findUnique({
            where: {
                userId_projectId: { userId, projectId: project.id }
            }
        });

        if (completed && completed.status === 'completed') {
            // Already done, redirect there?
            return completed;
        }

        // 3. Create or update assignment
        // We upsert to ensure we don't duplicate if already assigned
        return await prisma.judgeAssignment.upsert({
            where: {
                userId_projectId: { userId, projectId: project.id }
            },
            update: {
                status: 'assigned',
                isManual: false
            },
            create: {
                userId,
                projectId: project.id,
                status: 'assigned',
                isManual: false
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
                tableNumber: 'asc'
            }
        });
    },
    /**
     * Update a judge's curve.
     */
    updateJudgeCurve: async (userId: string, curve: number) => {
        return await prisma.user.update({
            where: { id: userId },
            data: { curve }
        });
    }
};
