import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { Judging } from '$lib/server/judging';

export const load: PageServerLoad = async () => {
    const { results, criteria, optOutRankings } = await Judging.getAllProjectScores();
    return { results, criteria, optOutRankings };
};

export const actions: Actions = {
    clearAll: async () => {
        try {
            await Judging.clearAllScores();
        } catch (e) {
            return fail(500, { message: "Failed to clear scores" });
        }
    }
};
