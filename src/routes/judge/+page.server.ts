import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Judging } from '$lib/server/judging';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ parent }) => {
    const { session } = await parent();
    if (!session) throw redirect(301, '/auth/login');

    const baseVisit = await Judging.assignNextTable(session.user.id);

    if (!baseVisit) {
        return { visit: null };
    }

    // Enrich with project details
    const visit = await prisma.tableVisit.findUnique({
        where: { id: baseVisit.id },
        include: {
            project: { select: { id: true, name: true, tableNumber: true } }
        }
    });

    return { visit };
};

export const actions: Actions = {
    start: async ({ request }) => {
        const { auth } = await import('$lib/server/auth');
        const session = await auth.api.getSession(request);
        if (!session) return fail(401);

        const form = await request.formData();
        const visitId = form.get('visitId') as string;
        if (!visitId) return fail(400, { message: 'Missing visitId' });

        try {
            const visit = await Judging.startJudging(session.user.id, visitId);
            throw redirect(303, `/judge/table/${visit.id}`);
        } catch (e) {
            if (e instanceof Response) throw e;
            console.error(e);
            return fail(500, { message: 'Failed to start judging.' });
        }
    }
};
