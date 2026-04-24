import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { prisma } from '$lib/server/prisma';
import { Judging } from '$lib/server/judging';

export const load: PageServerLoad = async ({ params, parent }) => {
    const { session } = await parent();
    if (!session) throw redirect(301, '/auth/login');

    const [visit, optionalCriteria] = await Promise.all([
        prisma.tableVisit.findUnique({
            where: { id: params.id },
            include: {
                project: { select: { id: true, name: true, tableNumber: true } }
            }
        }),
        prisma.judgingCriterion.findMany({
            where: { optional: true },
            orderBy: { order: 'asc' }
        })
    ]);

    if (!visit || visit.judgeId !== session.user.id) {
        throw redirect(303, '/judge');
    }

    return { visit, optionalCriteria };
};

export const actions: Actions = {
    submit: async ({ request, params }) => {
        const { auth } = await import('$lib/server/auth');
        const session = await auth.api.getSession(request);
        if (!session) return fail(401);

        const form = await request.formData();
        const feedback = (form.get('feedback') as string) ?? '';

        if (!feedback.trim()) {
            return fail(400, { message: 'Feedback is required.' });
        }

        // Determine which optional criteria were NOT attempted (unchecked = opted out)
        const allOptionalIds = ((form.get('optionalCriterionIds') as string) ?? '')
            .split(',')
            .filter(Boolean);
        const attemptedIds = new Set<string>();
        for (const [key, value] of form.entries()) {
            if (key.startsWith('attempted_') && value === 'on') {
                attemptedIds.add(key.slice('attempted_'.length));
            }
        }
        const optOutCriterionIds = allOptionalIds.filter((id) => !attemptedIds.has(id));

        let result;
        try {
            result = await Judging.submitFeedback(
                session.user.id,
                params.id,
                feedback.trim(),
                optOutCriterionIds
            );
        } catch (e) {
            console.error(e);
            return fail(500, { message: 'Failed to submit feedback.' });
        }

        if (result.comparison) {
            throw redirect(303, `/judge/compare/${result.comparison.id}`);
        }

        throw redirect(303, '/judge');
    }
};
