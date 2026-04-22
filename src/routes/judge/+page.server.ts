import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { Judging } from '$lib/server/judging';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ parent }) => {
    const { session } = await parent();
    if (!session) throw redirect(301, '/auth/login');

    const baseAssignment = await Judging.assignNextPair(session.user.id);

    if (!baseAssignment) {
        return { assignment: null };
    }

    // Load full assignment with project details for the dashboard
    const assignment = await prisma.pairAssignment.findUnique({
        where: { id: baseAssignment.id },
        include: {
            projectA: { select: { id: true, name: true, tableNumber: true } },
            projectB: { select: { id: true, name: true, tableNumber: true } }
        }
    });

    return { assignment };
};
