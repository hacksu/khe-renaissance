import { prisma } from '$lib/server/prisma';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
    const { session } = await parent();
    if (!session) throw redirect(301, "/auth/login");

    const assignments = await prisma.judgeAssignment.findMany({
        where: { userId: session.user.id },
        include: {
            project: {
                include: { Track: true }
            }
        },
        orderBy: [
            { status: 'desc' }, // 'in_progress' or 'assigned' first? actually we want 'assigned' top?
            // status: 'completed' vs 'assigned'.
            // if we want active first, filter or sort.
            { createdAt: 'desc' }
        ]
    });

    // Map to simple type if needed, or just return
    return {
        assignments: assignments.map(a => ({
            ...a,
            project: {
                ...a.project,
                track: a.project.Track?.name || a.project.track
            }
        }))
    };
};

export const actions: Actions = {
    judgeNext: async ({ request, locals }) => {
        // Need session. We can use locals or parent? locals is better in actions.
        // Wait, locals is passed to action.
        // But we need to make sure auth set locals.user.
        // Assuming hooks.server.ts populates locals.user from session.
        // Let's check hooks.server.ts later if this fails.
        // For now, rely on form data or locals if available.
        // Actually, let's fetch session from auth helper if locals isn't reliable yet?
        // Standard pattern: const session = await auth.api.getSession(request);

        // Simpler: Just implementing the logic assuming we can get userId.
        // I'll grab session inside action.
        const { auth } = await import('$lib/server/auth');
        const session = await auth.api.getSession(request);
        if (!session) return fail(401);
        const userId = session.user.id;

        // 1. Get IDs of projects user has already touched
        const userHistory = await prisma.judgeAssignment.findMany({
            where: { userId },
            select: { projectId: true }
        });
        const excludedIds = userHistory.map(h => h.projectId);

        // 2. Find optimal project
        // Sort by judgement count ASC, then active assignments ASC.
        // Prisma doesn't support complex ordering on relations easily without aggregate.
        // Strategy: Fetch candidate projects (annotated) or plain fetch and sort in memory if dataset small?
        // Or using orderBy: { judgements: { _count: 'asc' } } works.
        const candidates = await prisma.project.findMany({
            where: { id: { notIn: excludedIds } },
            include: {
                _count: {
                    select: {
                        judgements: true,
                        judgeAssignments: { where: { status: 'assigned' } }
                    }
                }
            },
            take: 50 // Limit to avoid massive sort
        });

        // In-memory sort for refined logic (since prisma sort by filtered relation count is hard)
        // Sort: Least judgements -> Least active assignments
        candidates.sort((a, b) => {
            if (a._count.judgements !== b._count.judgements) {
                return a._count.judgements - b._count.judgements;
            }
            return a._count.judgeAssignments - b._count.judgeAssignments;
        });

        const candidate = candidates[0];

        if (!candidate) {
            return fail(400, { message: "No projects available to judge!" });
        }

        // 3. Create Assignment
        const assignment = await prisma.judgeAssignment.create({
            data: {
                userId,
                projectId: candidate.id,
                status: 'assigned'
            }
        });

        throw redirect(303, `/judge/project/${candidate.id}`);
    }
};
