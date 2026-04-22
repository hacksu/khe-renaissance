import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Judging } from '$lib/server/judging';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params, parent }) => {
    const { session } = await parent();
    if (!session) throw redirect(301, '/auth/login');

    const result = await Judging.getPairForJudging(params.id, session.user.id);

    if (!result) {
        throw redirect(303, '/judge');
    }

    return {
        assignment: result.pairAssignment,
        criteria: result.criteria,
        previousComment: result.previousComment
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
            return fail(400, { message: 'Notes are required.' });
        }

        // Parse results: result_<criterionId> = 'A' | 'B' | 'OPT_OUT_A' | 'OPT_OUT_B'
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

        const criteriaCount = await prisma.judgingCriterion.count();
        if (results.length !== criteriaCount) {
            return fail(400, { message: 'All criteria must be evaluated.' });
        }

        try {
            await Judging.submitComparison(session.user.id, params.id, results, comment.trim());
        } catch (e) {
            console.error(e);
            return fail(500, { message: 'Failed to submit comparison.' });
        }

        throw redirect(303, '/judge');
    },

    skip: async ({ request, params }) => {
        const { auth } = await import('$lib/server/auth');
        const session = await auth.api.getSession(request);
        if (!session) return fail(401);

        const form = await request.formData();
        const skipReason = (form.get('skipReason') as string) ?? '';

        if (!skipReason.trim()) {
            return fail(400, { message: 'A reason is required to skip.' });
        }

        try {
            await Judging.skipPair(session.user.id, params.id, skipReason.trim());
        } catch (e) {
            console.error(e);
            return fail(500, { message: 'Failed to skip pair.' });
        }

        throw redirect(303, '/judge');
    }
};
