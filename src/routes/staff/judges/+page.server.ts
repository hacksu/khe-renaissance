import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { Judging } from "$lib/server/judging";

export const load: PageServerLoad = async () => {
    const judges = await Judging.getAllJudges();
    const projects = await Judging.getAllProjectsWithTables();
    return { judges, projects };
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
    }
};
