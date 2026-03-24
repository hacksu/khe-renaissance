import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { Judging } from "$lib/server/judging";
import { Settings } from "$lib/server/settings";
import { prisma } from "$lib/server/prisma";

export const load: PageServerLoad = async () => {
    const [judges, projects, timePerTable] = await Promise.all([
        Judging.getAllJudges(),
        Judging.getAllProjectsWithTables(),
        Settings.getTimePerTable()
    ]);
    return { judges, projects, timePerTable };
};

export const actions: Actions = {
    updateAssignments: async ({ request }) => {
        const form = await request.formData();
        const userId = form.get("userId") as string;
        const tableNumbers = form.get("tableNumbers") as string;

        if (!userId) return fail(400, { missing: true });

        try {
            await Judging.assignJudgeToTeams(userId, tableNumbers || "");

            const curve = form.get("curve");
            if (curve !== null) {
                const curveValue = parseFloat(curve.toString());
                if (!isNaN(curveValue)) {
                    await Judging.updateJudgeCurve(userId, curveValue);
                }
            }

            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { error: "Failed to update assignments" });
        }
    },
    updateCurve: async ({ request }) => {
        const form = await request.formData();
        const userId = form.get("userId") as string;
        const curve = form.get("curve");

        if (!userId) return fail(400, { missing: true });

        const curveValue = parseFloat(curve?.toString() ?? "0");
        if (isNaN(curveValue)) return fail(400, { error: "Invalid curve value" });

        try {
            await Judging.updateJudgeCurve(userId, curveValue);
            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { error: "Failed to update curve" });
        }
    },
    removeJudge: async ({ request }) => {
        const form = await request.formData();
        const userId = form.get("userId") as string;

        if (!userId) return fail(400, { missing: true });

        try {
            await prisma.user.update({
                where: { id: userId },
                data: { role: "user" }
            });
            await prisma.judgeAssignment.deleteMany({ where: { userId } });
            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { error: "Failed to remove judge" });
        }
    }
};
