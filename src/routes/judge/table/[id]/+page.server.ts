import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Judging } from '$lib/server/judging';
import { Settings } from '$lib/server/settings';

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
    end: async ({ params }) => {
        throw redirect(303, `/judge/table/${params.id}/feedback`);
    }
};
