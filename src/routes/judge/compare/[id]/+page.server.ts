import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Judging } from '$lib/server/judging';

export const load: PageServerLoad = async ({ params, parent }) => {
    const { session } = await parent();
    if (!session) throw redirect(301, '/auth/login');

    let result;
    try {
        result = await Judging.getComparison(session.user.id, params.id);
    } catch {
        throw redirect(303, '/judge');
    }

    return {
        comparison: result.comparison,
        criteria: result.criteria
    };
};

export const actions: Actions = {
    submit: async ({ request, params }) => {
        const { auth } = await import('$lib/server/auth');
        const session = await auth.api.getSession(request);
        if (!session) return fail(401);

        const form = await request.formData();
        const comment = (form.get('comment') as string) ?? '';

        if (!comment.trim()) {
            return fail(400, { message: 'A comment is required.' });
        }

        // Parse result_{criterionId} fields
        const results: { criterionId: string; winner: 'A' | 'B' | 'OPT_OUT_A' | 'OPT_OUT_B' }[] = [];
        for (const [key, value] of form.entries()) {
            if (key.startsWith('result_')) {
                const criterionId = key.slice('result_'.length);
                const winner = value as string;
                if (winner === 'A' || winner === 'B' || winner === 'OPT_OUT_A' || winner === 'OPT_OUT_B') {
                    results.push({ criterionId, winner });
                }
            }
        }

        // Validate all criteria have a result
        let result;
        try {
            result = await Judging.getComparison(session.user.id, params.id);
        } catch {
            return fail(404, { message: 'Comparison not found.' });
        }

        if (results.length !== result.criteria.length) {
            return fail(400, { message: 'All categories must have a selection.' });
        }

        try {
            await Judging.submitComparison(session.user.id, params.id, results, comment.trim());
        } catch (e) {
            console.error(e);
            return fail(500, { message: 'Failed to submit comparison.' });
        }

        throw redirect(303, '/judge');
    }
};
