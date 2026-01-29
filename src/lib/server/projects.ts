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
            // Fallback for dev/demo if DB is down
            return [
                { id: '1', name: 'Mock Project A', track: 'General', tableNumber: '101', members: [], Track: { name: 'General' } as any, trackId: null, createdAt: new Date() } as any
            ];
        }
    },

    /**
     * Get all tracks.
     */
    getAllTracks: async () => {
        try {
            return await prisma.track.findMany({ orderBy: { name: 'asc' } });
        } catch (e) {
            return [
                { id: 't1', name: 'General' },
                { id: 't2', name: 'Healthcare' }
            ];
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
            return [
                { id: 'a1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', school: 'KSU', user: { email: 'john@example.com' } } as any
            ];
        }
    },

    /**
     * Create a new project.
     */
    createProject: async (name: string, trackId: string, tableNumber: string) => {
        // resolve track name for legacy
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
