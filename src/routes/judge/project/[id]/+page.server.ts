import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { Project } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
    const projectId = params.id;

    // In real DB: await prisma.project.findUnique({ where: { id: projectId } })

    // Mock Data Lookup matching definitions in +page.server.ts
    const projects: Project[] = [
        { id: '7', name: "Team #7", track: "General (Open-Ended)", description: null, tableNumber: null },
        { id: '12', name: "Team #12", track: "Business Analytics", description: null, tableNumber: null },
        { id: '4', name: "Team #4", track: "General (Open-Ended)", description: null, tableNumber: null },
        { id: '9', name: "Team #9", track: "Education Tech", description: null, tableNumber: null },
        { id: '15', name: "Team #15", track: "Healthcare", description: null, tableNumber: null }
    ];

    const project = projects.find(p => p.id === projectId);

    if (!project) {
        throw error(404, "Project not found");
    }

    return {
        project
    };
};
