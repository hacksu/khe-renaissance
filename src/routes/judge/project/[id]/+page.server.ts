import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Judging } from '$lib/server/judging';
import { Settings } from '$lib/server/settings';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params, locals, request }) => {
    const { auth } = await import('$lib/server/auth');
    const session = await auth.api.getSession(request);

    const [result, timePerTable] = await Promise.all([
        Judging.getProjectForJudging(params.id, session?.user?.id),
        Settings.getTimePerTable()
    ]);

    if (!result) {
        throw error(404, "Project not found");
    }

    let startedAt: Date | null = null;
    if (session?.user?.id) {
        const key = { userId: session.user.id, projectId: params.id };
        const assignment = await prisma.judgeAssignment.findUnique({
            where: { userId_projectId: key },
            select: { startedAt: true }
        });
        if (assignment) {
            startedAt = assignment.startedAt;
            if (!startedAt) {
                ({ startedAt } = await prisma.judgeAssignment.update({
                    where: { userId_projectId: key },
                    data: { startedAt: new Date() },
                    select: { startedAt: true }
                }));
            }
        }
    }

    return { ...result, timePerTable, startedAt };
};

export const actions: Actions = {
    skip: async ({ request, params }) => {
        const { auth } = await import('$lib/server/auth');
        const session = await auth.api.getSession(request);
        if (!session) return fail(401);

        const form = await request.formData();
        const reason = (form.get('reason') as string) ?? '';

        if (reason.trim().length < 2) {
            return fail(400, { message: "A reason is required to skip" });
        }

        try {
            await Judging.skipProject(session.user.id, params.id, reason.trim());
        } catch (e) {
            console.error(e);
            return fail(500, { message: "Failed to skip project" });
        }

        throw redirect(303, '/judge');
    },

    saveScores: async ({ request, params }) => {
        const { auth } = await import('$lib/server/auth');
        const session = await auth.api.getSession(request);
        if (!session) return fail(401);
        const userId = session.user.id;
        const projectId = params.id;

        const form = await request.formData();

        const comment = form.get('comment') as string;

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
            await Judging.submitScore(userId, projectId, scores);
            await Judging.submitComment(userId, projectId, comment);
        } catch (e) {
            console.error(e);
            return fail(500, { message: "Failed to save scores" });
        }

        throw redirect(303, `/judge/project/${projectId}/submitted`);
    }
};
