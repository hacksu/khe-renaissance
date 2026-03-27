import { prisma } from "$lib/server/prisma";
import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { Settings, SETTING_KEYS } from "$lib/server/settings";

export const load: PageServerLoad = async () => {
    let tracks: any[] = [];
    let criteria: any[] = [];

    try {
        tracks = await prisma.track.findMany({ orderBy: { name: 'asc' } });
        criteria = await prisma.judgingCriterion.findMany({ orderBy: { order: 'asc' } });
    } catch (e) {
        console.error("Failed to load metadata", e);
    }

    const [maxTablesPerJudge, maxJudgesPerTeam, timePerTable, judgeCount, tableCount] = await Promise.all([
        Settings.getMaxTablesPerJudge(),
        Settings.getMaxJudgesPerTeam(),
        Settings.getTimePerTable(),
        prisma.user.count({ where: { role: 'judge' } }),
        prisma.project.count()
    ]);

    return { tracks, criteria, maxTablesPerJudge, maxJudgesPerTeam, timePerTable, judgeCount, tableCount };
};

export const actions: Actions = {
    createTrack: async ({ request }) => {
        const form = await request.formData();
        const name = form.get("name") as string;
        const description = form.get("description") as string;

        if (!name) return fail(400, { missing: true });

        try {
            await prisma.track.create({
                data: { name, description }
            });
        } catch (e) {
            return fail(500, { error: "Failed to create track" });
        }
    },
    updateTrack: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;
        const name = form.get("name") as string;
        const description = form.get("description") as string;

        if (!id || !name) return fail(400, { missing: true });

        try {
            await prisma.track.update({
                where: { id },
                data: { name, description: description || null }
            });
        } catch (e) {
            return fail(500, { error: "Failed to update track" });
        }
    },
    deleteTrack: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;

        try {
            await prisma.track.delete({ where: { id } });
        } catch (e) {
            return fail(500, { error: "Failed to delete track" });
        }
    },
    createCriterion: async ({ request }) => {
        const form = await request.formData();
        const name = form.get("name") as string;
        const maxScore = Number(form.get("maxScore"));
        const order = Number(form.get("order"));
        const optional = form.get("optional") === "on";
        // create a slug from name
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');

        if (!name) return fail(400, { missing: true });

        try {
            await prisma.judgingCriterion.create({
                data: { name, slug, maxScore: maxScore || 5, order: order || 0, optional }
            });
        } catch (e) {
            return fail(500, { error: "Failed to create criterion" });
        }
    },
    updateCriterion: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;
        const name = form.get("name") as string;
        const maxScore = Number(form.get("maxScore"));
        const order = Number(form.get("order"));
        const optional = form.get("optional") === "on";

        if (!id || !name) return fail(400, { missing: true });

        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');

        try {
            await prisma.judgingCriterion.update({
                where: { id },
                data: { name, slug, maxScore: maxScore || 5, order: order || 0, optional }
            });
        } catch (e) {
            return fail(500, { error: "Failed to update criterion" });
        }
    },
    deleteCriterion: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;

        try {
            await prisma.judgingCriterion.delete({ where: { id } });
        } catch (e) {
            return fail(500, { error: "Failed to delete criterion" });
        }
    },
    updateJudgingSettings: async ({ request }) => {
        const form = await request.formData();

        const saveIntSetting = async (key: string, raw: string) => {
            if (raw === '' || raw === null) {
                await prisma.setting.deleteMany({ where: { key } });
            } else {
                const n = parseInt(raw);
                if (isNaN(n) || n < 1) return fail(400, { error: `Invalid value for ${key}` });
                await Settings.set(key, String(n));
            }
        };

        try {
            await saveIntSetting(SETTING_KEYS.MAX_TABLES_PER_JUDGE, form.get("maxTablesPerJudge") as string);
            await saveIntSetting(SETTING_KEYS.MAX_JUDGES_PER_TEAM, form.get("maxJudgesPerTeam") as string);
            await saveIntSetting(SETTING_KEYS.TIME_PER_TABLE, form.get("timePerTable") as string);
        } catch (e) {
            return fail(500, { error: "Failed to save settings" });
        }
    }
};
