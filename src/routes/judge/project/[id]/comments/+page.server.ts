import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';
import { Judging } from '$lib/server/judging';

export const load: PageServerLoad = async ({ params }) => {
    // We can reuse getProjectForJudging to get the name/details
    // Or just simple queries. Using the service is cleaner.
    const result = await Judging.getProjectForJudging(params.id);
    return { project: result?.project };
};

export const actions: Actions = {
    saveComment: async ({ request, params }) => {
        const { auth } = await import('$lib/server/auth');
        const session = await auth.api.getSession(request);
        if (!session) return fail(401);
        const userId = session.user.id;
        const projectId = params.id;

        if (!projectId) return fail(400, { message: "Missing project ID" });

        const form = await request.formData();
        const comment = form.get('comment') as string;

        try {
            await Judging.submitComment(userId, projectId, comment);
        } catch (e) {
            console.error(e);
            return fail(500, { message: "Failed to save comment" });
        }

        throw redirect(303, `/judge/project/${projectId}/submitted`);
    }
};
