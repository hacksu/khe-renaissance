import type { Actions, PageServerLoad } from "./$types";
import { fail } from "@sveltejs/kit";
import { Projects } from "$lib/server/projects";

export const load: PageServerLoad = async () => {
    const projects = await Projects.getAllProjects();
    const unassignedParticipants = await Projects.getUnassignedApplications();
    const tracks = await Projects.getAllTracks();

    return {
        projects,
        unassignedParticipants,
        tracks
    };
};

export const actions: Actions = {
    createProject: async ({ request }) => {
        const form = await request.formData();
        const name = form.get("name") as string;
        const trackId = form.get("track") as string; 
        const tableNumber = form.get("tableNumber") as string;

        if (!name) return fail(400, { missing: true });

        try {
            await Projects.createProject(name, trackId, tableNumber);
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
            await Projects.assignParticipant(applicationId, projectId);
        } catch (e) {
            return fail(500, { error: "Failed to assign" });
        }
    },
    removeParticipant: async ({ request }) => {
        const form = await request.formData();
        const applicationId = form.get("applicationId") as string;

        if (!applicationId) return fail(400, { missing: true });

        try {
            await Projects.removeParticipant(applicationId);
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
            await Projects.updateProject(id, name, trackId, tableNumber);
        } catch (e) {
            console.error("Failed to update project", e);
            return fail(500, { error: "Failed to update project" });
        }
    }
};
