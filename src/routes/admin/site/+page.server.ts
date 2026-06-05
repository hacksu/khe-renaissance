import { prisma } from "$lib/server/prisma";
import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
    const [sponsors, prizes, schedule] = await Promise.all([
        prisma.sponsor.findMany({ orderBy: { order: 'asc' } }),
        prisma.prize.findMany({ orderBy: { order: 'asc' } }),
        prisma.scheduleEvent.findMany({ orderBy: { order: 'asc' } }),
    ]);
    return { sponsors, prizes, schedule };
};

export const actions: Actions = {
    createSponsor: async ({ request }) => {
        const form = await request.formData();
        const name = (form.get("name") as string)?.trim();
        const url = (form.get("url") as string)?.trim();
        const imageUrl = (form.get("imageUrl") as string)?.trim();
        const tier = (form.get("tier") as string) || "squire";
        const order = Number(form.get("order") || 0);
        if (!name || !url || !imageUrl) return fail(400, { error: "Name, URL, and image URL are required" });
        try {
            await prisma.sponsor.create({ data: { name, url, imageUrl, tier, order } });
        } catch (e) {
            return fail(500, { error: "Failed to create sponsor" });
        }
    },
    updateSponsor: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;
        const name = (form.get("name") as string)?.trim();
        const url = (form.get("url") as string)?.trim();
        const imageUrl = (form.get("imageUrl") as string)?.trim();
        const tier = (form.get("tier") as string) || "squire";
        const order = Number(form.get("order") || 0);
        if (!id || !name || !url || !imageUrl) return fail(400, { error: "Missing required fields" });
        try {
            await prisma.sponsor.update({ where: { id }, data: { name, url, imageUrl, tier, order } });
        } catch (e) {
            return fail(500, { error: "Failed to update sponsor" });
        }
    },
    deleteSponsor: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;
        try {
            await prisma.sponsor.delete({ where: { id } });
        } catch (e) {
            return fail(500, { error: "Failed to delete sponsor" });
        }
    },
    createPrize: async ({ request }) => {
        const form = await request.formData();
        const category = form.get("category") as string;
        const itemName = (form.get("itemName") as string)?.trim();
        const detail = (form.get("detail") as string)?.trim() || "";
        const imageUrl = (form.get("imageUrl") as string)?.trim() || "";
        const order = Number(form.get("order") || 0);
        const place = (form.get("place") as string)?.trim() || null;
        const accentColor = (form.get("accentColor") as string)?.trim() || null;
        const crown = (form.get("crown") as string)?.trim() || null;
        const trackName = (form.get("trackName") as string)?.trim() || null;
        const awardName = (form.get("awardName") as string)?.trim() || null;
        if (!category || !itemName) return fail(400, { error: "Category and item name are required" });
        try {
            await prisma.prize.create({ data: { category, itemName, detail, imageUrl, order, place, accentColor, crown, trackName, awardName } });
        } catch (e) {
            return fail(500, { error: "Failed to create prize" });
        }
    },
    updatePrize: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;
        const itemName = (form.get("itemName") as string)?.trim();
        const detail = (form.get("detail") as string)?.trim() || "";
        const imageUrl = (form.get("imageUrl") as string)?.trim() || "";
        const order = Number(form.get("order") || 0);
        const place = (form.get("place") as string)?.trim() || null;
        const accentColor = (form.get("accentColor") as string)?.trim() || null;
        const crown = (form.get("crown") as string)?.trim() || null;
        const trackName = (form.get("trackName") as string)?.trim() || null;
        const awardName = (form.get("awardName") as string)?.trim() || null;
        if (!id || !itemName) return fail(400, { error: "Missing required fields" });
        try {
            await prisma.prize.update({ where: { id }, data: { itemName, detail, imageUrl, order, place, accentColor, crown, trackName, awardName } });
        } catch (e) {
            return fail(500, { error: "Failed to update prize" });
        }
    },
    deletePrize: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;
        try {
            await prisma.prize.delete({ where: { id } });
        } catch (e) {
            return fail(500, { error: "Failed to delete prize" });
        }
    },
    createScheduleEvent: async ({ request }) => {
        const form = await request.formData();
        const day = (form.get("day") as string)?.trim();
        const time = (form.get("time") as string)?.trim();
        const event = (form.get("event") as string)?.trim();
        const type = (form.get("type") as string) || "event";
        const highlight = form.get("highlight") === "on";
        const order = Number(form.get("order") || 0);
        if (!day || !time || !event) return fail(400, { error: "Day, time, and event name are required" });
        try {
            await prisma.scheduleEvent.create({ data: { day, time, event, type, highlight, order } });
        } catch (e) {
            return fail(500, { error: "Failed to create schedule event" });
        }
    },
    updateScheduleEvent: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;
        const day = (form.get("day") as string)?.trim();
        const time = (form.get("time") as string)?.trim();
        const event = (form.get("event") as string)?.trim();
        const type = (form.get("type") as string) || "event";
        const highlight = form.get("highlight") === "on";
        const order = Number(form.get("order") || 0);
        if (!id || !day || !time || !event) return fail(400, { error: "Missing required fields" });
        try {
            await prisma.scheduleEvent.update({ where: { id }, data: { day, time, event, type, highlight, order } });
        } catch (e) {
            return fail(500, { error: "Failed to update schedule event" });
        }
    },
    deleteScheduleEvent: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;
        try {
            await prisma.scheduleEvent.delete({ where: { id } });
        } catch (e) {
            return fail(500, { error: "Failed to delete schedule event" });
        }
    },
};
