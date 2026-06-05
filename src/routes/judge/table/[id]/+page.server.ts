import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Judging } from '$lib/server/judging';
import { Settings } from '$lib/server/settings';
import { Role } from '$lib/server/external_roles';

export const load: PageServerLoad = async ({ params, parent }) => {
    const { session } = await parent();
    if (!session) throw redirect(301, '/auth/login');

    let result;
    try {
        result = await Judging.getActiveVisit(session.user.id, params.id);
    } catch {
        throw redirect(303, '/judge');
    }

    const timePerTable = await Settings.getTimePerTable();

    return {
        visit: result.visit,
        criteria: result.criteria,
        timePerTable
    };
};

export const actions: Actions = {
    end: async ({ request, params }) => {
        const { auth } = await import('$lib/server/auth');
        const session = await auth.api.getSession(request);
        if (!session) return fail(401);
        if (session.user.role !== Role.JUDGE) return fail(403);
        throw redirect(303, `/judge/table/${params.id}/feedback`);
    }
};
