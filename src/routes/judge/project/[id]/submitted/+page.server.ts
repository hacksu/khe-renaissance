import { prisma } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
    const { session } = await parent();
    if (!session) throw redirect(301, "/auth/login");

    const userId = session.user.id;

    const assignments = await prisma.judgeAssignment.findMany({
        where: { userId, status: 'assigned' }
    });

    const remaining = assignments.length;

    // Check if judge is in manual mode (has any manual assignment)
    const manualCount = await prisma.judgeAssignment.count({
        where: { userId, isManual: true }
    });
    const isManual = manualCount > 0;

    let hasMore = remaining > 0;

    if (!isManual && !hasMore) {
        // Auto-judge: check if there are any untouched projects left
        const history = await prisma.judgeAssignment.findMany({
            where: { userId },
            select: { projectId: true }
        });
        const touchedIds = history.map(h => h.projectId);
        const untouchedCount = await prisma.project.count({
            where: { id: { notIn: touchedIds } }
        });
        hasMore = untouchedCount > 0;
    }

    return { remaining, hasMore };
};
