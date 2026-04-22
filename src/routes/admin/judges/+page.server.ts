import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { Judging } from "$lib/server/judging";
import { prisma } from "$lib/server/prisma";
import { Settings } from "$lib/server/settings";

export const load: PageServerLoad = async () => {
    const [judges, timePerTable] = await Promise.all([
        Judging.getAllJudges(),
        Settings.getTimePerTable()
    ]);
    return { judges, timePerTable };
};

export const actions: Actions = {
    updateTrack: async ({ request }) => {
        const { auth } = await import('$lib/server/auth');
        const session = await auth.api.getSession(request);
        if (!session || session.user.role !== 'staff') return fail(401, { error: 'Unauthorized' });

        const form = await request.formData();
        const userId = form.get("userId") as string;
        const judgeTrack = form.get("judgeTrack") as string;

        if (!userId) return fail(400, { missing: true });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'judge') return fail(400, { error: 'User not found or is not a judge' });

        try {
            await prisma.user.update({
                where: { id: userId },
                data: { judgeTrack: judgeTrack || null }
            });
            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { error: "Failed to update judge track" });
        }
    },
    removeJudge: async ({ request }) => {
        const { auth } = await import('$lib/server/auth');
        const session = await auth.api.getSession(request);
        if (!session || session.user.role !== 'staff') return fail(401, { error: 'Unauthorized' });

        const form = await request.formData();
        const userId = form.get("userId") as string;

        if (!userId) return fail(400, { missing: true });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'judge') return fail(400, { error: 'User not found or is not a judge' });

        try {
            await prisma.user.update({
                where: { id: userId },
                data: { role: "user" }
            });
            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { error: "Failed to remove judge" });
        }
    }
};
