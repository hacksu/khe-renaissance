import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { Judging } from '$lib/server/judging';
import { Settings } from '$lib/server/settings';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async ({ parent }) => {
    const { session } = await parent();
    if (!session) throw redirect(301, "/auth/login");

    const [assignments, maxTablesPerJudge, maxJudgesPerTeam] = await Promise.all([
        Judging.getJudgeAssignments(session.user.id),
        Settings.getMaxTablesPerJudge(),
        Settings.getMaxJudgesPerTeam()
    ]);

    let allTeamsFull = false;
    if (maxJudgesPerTeam !== null) {
        const projects = await prisma.project.findMany({
            select: { _count: { select: { judgements: true } } }
        });
        allTeamsFull = projects.length > 0 && projects.every(p => p._count.judgements >= maxJudgesPerTeam);
    }

    return { assignments, maxTablesPerJudge, allTeamsFull };
};

export const actions: Actions = {
    judgeNext: async ({ request }) => {
        const { auth } = await import('$lib/server/auth');
        const session = await auth.api.getSession(request);
        if (!session) return fail(401);

        try {
            const assignment = await Judging.assignNextProject(session.user.id);

            if (!assignment) {
                return fail(400, { message: "No projects available to judge!" });
            }

            throw redirect(303, `/judge/project/${assignment.projectId}`);
        } catch (e) {
            // Rethrow redirects
            if ((e as any)?.status === 303) throw e;
            console.error(e);
            return fail(500, { message: "Failed to assign project" });
        }
    },

    manualEntry: async ({ request }) => {
        const { auth } = await import('$lib/server/auth');
        const session = await auth.api.getSession(request);
        if (!session) return fail(401);

        const data = await request.formData();
        const tableNumber = data.get('tableNumber')?.toString();

        if (!tableNumber) {
            return fail(400, { manualEntryError: "Please enter a table number." });
        }

        try {
            const assignment = await Judging.assignJudgeToTable(session.user.id, tableNumber);
            if (!assignment) return fail(404, { manualEntryError: `Project with table #${tableNumber} not found.` });

            throw redirect(303, `/judge/project/${assignment.projectId}`);
        } catch (e) {
            if ((e as any)?.status === 303) throw e;
            if ((e as any)?.message === 'cap') return fail(400, { manualEntryError: "You've reached your judging limit." });
            console.error(e);
            return fail(404, { manualEntryError: "Failed to find or assign project." });
        }
    }
};
