import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const projectId = parseInt(params.id);

    // Mock Data Lookup
    const projects = [
        { id: 7, name: "Team #7", track: "General (Open-Ended)", status: "completed" },
        { id: 12, name: "Team #12", track: "Business Analytics", status: "assigned" },
        { id: 4, name: "Team #4", track: "General (Open-Ended)", status: "assigned" },
        { id: 9, name: "Team #9", track: "Education Tech", status: "remaining" },
        { id: 15, name: "Team #15", track: "Healthcare", status: "remaining" }
    ];

    const project = projects.find(p => p.id === projectId);

    if (!project) {
        throw error(404, "Project not found");
    }

    return {
        project
    };
};
