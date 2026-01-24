import { prisma } from "$lib/server/prisma";
import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
    let projects = [];
    let unassignedParticipants = [];
    let tracks = [];

    try {
        tracks = await prisma.track.findMany({ orderBy: { name: 'asc' } });

        projects = await prisma.project.findMany({
            include: {
                members: {
                    include: { user: true }
                },
                Track: true
            },
            orderBy: { name: 'asc' }
        });

        // Get checked-in applicants who are NOT in a project
        unassignedParticipants = await prisma.application.findMany({
            where: {
                checkedIn: true,
                projectId: null
            },
            include: { user: true },
            orderBy: { firstName: 'asc' } // or whatever
        });
    } catch (e) {
        console.error("DB Error or Schema not synced:", e);
        // Fallback for dev/demo if DB is down
        // Mock data
        projects = [
            { id: '1', name: 'Mock Project A', track: 'General', tableNumber: '101', members: [], Track: { name: 'General' } }
        ];
        unassignedParticipants = [
            { id: 'a1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', school: 'KSU', user: { email: 'john@example.com' } }
        ];
        tracks = [
            { id: 't1', name: 'General' },
            { id: 't2', name: 'Healthcare' }
        ];
    }

    return {
        projects: projects.map(p => ({
            ...p,
            track: p.Track?.name || p.track // Normalize track name for UI
        })),
        unassignedParticipants,
        tracks
    };
};

export const actions: Actions = {
    createProject: async ({ request }) => {
        const form = await request.formData();
        const name = form.get("name") as string;
        const trackId = form.get("track") as string; // Form sends ID now
        const tableNumber = form.get("tableNumber") as string;

        if (!name) return fail(400, { missing: true });

        try {
            // resolve track name for legacy
            let trackName = "General";
            if (trackId) {
                const t = await prisma.track.findUnique({ where: { id: trackId } });
                if (t) trackName = t.name;
            }

            await prisma.project.create({
                data: {
                    name,
                    track: trackName,
                    trackId: trackId || undefined,
                    tableNumber
                }
            });
        } catch (e) {
            console.error("Failed to create project", e);
            return fail(500, { error: "Failed to create project" });
        }
    },
    assignParticipant: async ({ request }) => {
        const form = await request.formData();
        const applicationId = form.get("applicationId") as string;
        const projectId = form.get("projectId") as string;

        if (!applicationId || !projectId) return fail(400, { missing: true });

        try {
            await prisma.application.update({
                where: { id: applicationId },
                data: { projectId }
            });
        } catch (e) {
            return fail(500, { error: "Failed to assign" });
        }
    },
    removeParticipant: async ({ request }) => {
        const form = await request.formData();
        const applicationId = form.get("applicationId") as string;

        if (!applicationId) return fail(400, { missing: true });

        try {
            await prisma.application.update({
                where: { id: applicationId },
                data: { projectId: null }
            });
        } catch (e) {
            return fail(500, { error: "Failed to remove" });
        }
    },
    updateProject: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;
        const name = form.get("name") as string;
        const trackId = form.get("track") as string;
        const tableNumber = form.get("tableNumber") as string;

        if (!id || !name) return fail(400, { missing: true });

        try {
            // resolve track name for legacy
            let trackName = "General";
            if (trackId) {
                const t = await prisma.track.findUnique({ where: { id: trackId } });
                if (t) trackName = t.name;
            }

            await prisma.project.update({
                where: { id },
                data: {
                    name,
                    track: trackName,
                    trackId: trackId || null,
                    tableNumber
                }
            });
        } catch (e) {
            console.error("Failed to update project", e);
            return fail(500, { error: "Failed to update project" });
        }
    }
};
