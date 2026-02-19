import { prisma } from "$lib/server/prisma";
import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
    let tracks: any[] = [];
    let criteria: any[] = [];

    try {
        tracks = await prisma.track.findMany({ orderBy: { name: 'asc' } });
        criteria = await prisma.judgingCriterion.findMany({ orderBy: { order: 'asc' } });
    } catch (e) {
        console.error("Failed to load metadata", e);
    }

    return { tracks, criteria };
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
    deleteCriterion: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;

        try {
            await prisma.judgingCriterion.delete({ where: { id } });
        } catch (e) {
            return fail(500, { error: "Failed to delete criterion" });
        }
    }
};
