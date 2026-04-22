import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { Judging } from "$lib/server/judging";
import { prisma } from "$lib/server/prisma";

export const load: PageServerLoad = async () => {
    const judges = await Judging.getAllJudges();
    return { judges };
};

export const actions: Actions = {
    updateTrack: async ({ request }) => {
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
