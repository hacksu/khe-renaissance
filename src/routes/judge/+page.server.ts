import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Judging } from '$lib/server/judging';

export const load: PageServerLoad = async ({ parent }) => {
    const { session } = await parent();
    if (!session) throw redirect(301, "/auth/login");

    const assignments = await Judging.getJudgeAssignments(session.user.id);

    return { assignments };
};

export const actions: Actions = {
    judgeNext: async ({ request }) => {
        const { auth } = await import('$lib/server/auth');
        const session = await auth.api.getSession(request);
        if (!session) return fail(401);

        try {
            const assignment = await Judging.assignNextProject(session.user.id);

            if (!assignment) {
                return fail(400, { message: "No projects available to judge!" });
            }

            throw redirect(303, `/judge/project/${assignment.projectId}`);
        } catch (e) {
            // Rethrow redirects
            if ((e as any)?.status === 303) throw e;
            console.error(e);
            return fail(500, { message: "Failed to assign project" });
        }
    }
};
