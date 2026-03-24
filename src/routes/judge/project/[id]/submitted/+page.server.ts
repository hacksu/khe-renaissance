import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
    const { session } = await parent();
    if (!session) throw redirect(301, "/auth/login");

    const remaining = await prisma.judgeAssignment.count({
        where: { userId: session.user.id, status: 'assigned' }
    });

    return { remaining };
};
