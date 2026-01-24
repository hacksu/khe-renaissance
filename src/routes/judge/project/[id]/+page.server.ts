import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const projectId = params.id;

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { Track: true }
    });

    if (!project) {
        throw error(404, "Project not found");
    }

    const criteria = await prisma.judgingCriterion.findMany({
        orderBy: { order: 'asc' }
    });

    return {
        project: {
            ...project,
            track: project.Track?.name || project.track // Fallback to legacy string if relation missing
        },
        criteria
    };
};

import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
    saveScores: async ({ request, locals, params }) => {
        const { auth } = await import('$lib/server/auth');
        const session = await auth.api.getSession(request);
        if (!session) return fail(401);
        const userId = session.user.id;
        const projectId = params.id;

        const form = await request.formData();

        // Parse scores: score_<criterionId>
        const scores: { criterionId: string, score: number }[] = [];
        for (const [key, value] of form.entries()) {
            if (key.startsWith('score_')) {
                const criterionId = key.replace('score_', '');
                const score = Number(value);
                if (score > 0) {
                    scores.push({ criterionId, score });
                }
            }
        }

        if (scores.length === 0) {
            return fail(400, { message: "No scores submitted" });
        }

        try {
            // Upsert Judgement
            // If exists (partial?), update it.
            // unique([userId, projectId])
            const judgement = await prisma.judgement.upsert({
                where: {
                    userId_projectId: { userId, projectId }
                },
                update: {
                    // Update scores: Delete old, insert new (simplest for now)
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

            // Status limit:
            // We don't mark assignment completed yet, wait for comments.
        } catch (e) {
            console.error(e);
            return fail(500, { message: "Failed to save scores" });
        }

        throw redirect(303, `/judge/project/${projectId}/comments`);
    }
};
