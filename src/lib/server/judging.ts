import { prisma } from '$lib/server/prisma';
import { sendJudgeFeedbackEmail } from '$lib/server/email';

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

        // 0.5 Check if user is in "Manual Mode"
        // If they have ANY assignment (past or present) that is manual, they are a manual judge.
        // We do NOT want to give them auto-assigned projects.
        const manualAssignments = await prisma.judgeAssignment.count({
            where: {
                userId,
                isManual: true
            }
        });

        if (manualAssignments > 0) {
            // STRICT MODE: You only get what you are assigned.
            return null;
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
                status: 'assigned',
                isManual: false
            }
        });

        return assignment;
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
                include: { scores: true }
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

        return grouped;
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
                        }
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
                const scores = j.scores.map(s => ({
                    name: s.criterion.name,
                    value: s.score,
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

        // Manual assignment implies we want these specific ones.
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
        // 1. Find project by table
        const project = await prisma.project.findFirst({
            where: { tableNumber }
        });

        if (!project) {
            throw new Error(`No project found at table ${tableNumber}`);
        }

        // 2. Check if already completed
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
                // ordering by table number string might be weird ("1", "10", "2"), but okay for now
                tableNumber: 'asc'
            }
        });
    }
};
