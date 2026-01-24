import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Judging } from '$lib/server/judging';

export const load: PageServerLoad = async ({ params }) => {
    const result = await Judging.getProjectForJudging(params.id);

    if (!result) {
        throw error(404, "Project not found");
    }

    return result;
};

export const actions: Actions = {
    saveScores: async ({ request, params }) => {
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
            await Judging.submitScore(userId, projectId, scores);
        } catch (e) {
            console.error(e);
            return fail(500, { message: "Failed to save scores" });
        }

        throw redirect(303, `/judge/project/${projectId}/comments`);
    }
};
