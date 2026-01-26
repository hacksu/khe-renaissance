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
    }
};
