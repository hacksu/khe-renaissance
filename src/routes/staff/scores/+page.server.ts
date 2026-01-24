import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { Judging } from '$lib/server/judging';

export const load: PageServerLoad = async () => {
    const results = await Judging.getAllProjectScores();
    return { results };
};

export const actions: Actions = {
    clearAll: async ({ request }) => {
        // Double check intent? Ideally UI has confirmation.
        try {
            await Judging.clearAllScores();
        } catch (e) {
            return fail(500, { message: "Failed to clear scores" });
        }
    }
};
