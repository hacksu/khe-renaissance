import { prisma } from "$lib/server/prisma";

export const Projects = {
    /**
     * Get all projects with members and track info.
     */
    getAllProjects: async () => {
        try {
            const projects = await prisma.project.findMany({
                include: {
                    members: {
                        include: { user: true }
                    },
                    Track: true
                },
                orderBy: { name: 'asc' }
            });

            return projects.map(p => ({
                ...p,
                track: p.Track?.name || p.track // Normalize track name for UI
            }));
        } catch (e) {
            console.error("DB Error or Schema not synced:", e);
            return [];
        }
    },

    /**
     * Get all tracks.
     */
    getAllTracks: async () => {
        try {
            return await prisma.track.findMany({ orderBy: { name: 'asc' } });
        } catch (e) {
            return [];
        }
    },

    /**
     * Get checked-in applicants who are NOT in a project.
     */
    getUnassignedApplications: async () => {
        try {
            return await prisma.application.findMany({
                where: {
                    checkedIn: true,
                    projectId: null
                },
                include: { user: true },
                orderBy: { firstName: 'asc' }
            });
        } catch (e) {
            return [];
        }
    },

    /**
     * Create a new project.
     */
    createProject: async (name: string, trackId: string, tableNumber: string) => {
        let trackName = "General";
        if (trackId) {
            const t = await prisma.track.findUnique({ where: { id: trackId } });
            if (t) trackName = t.name;
        }

        return await prisma.project.create({
            data: {
                name,
                track: trackName,
                trackId: trackId || undefined,
                tableNumber
            }
        });
    },

    /**
     * Update an existing project.
     */
    updateProject: async (id: string, name: string, trackId: string, tableNumber: string) => {
        let trackName = "General";
        if (trackId) {
            const t = await prisma.track.findUnique({ where: { id: trackId } });
            if (t) trackName = t.name;
        }

        return await prisma.project.update({
            where: { id },
            data: {
                name,
                track: trackName,
                trackId: trackId || null,
                tableNumber
            }
        });
    },

    /**
     * Assign a participant to a project.
     */
    assignParticipant: async (applicationId: string, projectId: string) => {
        return await prisma.application.update({
            where: { id: applicationId },
            data: { projectId }
        });
    },

    /**
     * Remove a participant from a project.
     */
    removeParticipant: async (applicationId: string) => {
        return await prisma.application.update({
            where: { id: applicationId },
            data: { projectId: null }
        });
    },

    /**
     * Find a project by table number.
     */
    getByTableNumber: async (tableNumber: string) => {
        return await prisma.project.findFirst({
            where: {
                tableNumber: {
                    equals: tableNumber,
                    mode: 'insensitive'
                }
            }
        });
    }
};
