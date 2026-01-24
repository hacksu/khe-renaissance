import { prisma } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const projectId = params.id;

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: { Track: true }
    });

    if (!project) {
        throw error(404, "Project not found");
    }

    const criteria = await prisma.judgingCriterion.findMany({
        orderBy: { order: 'asc' }
    });

    return {
        project: {
            ...project,
            track: project.Track?.name || project.track // Fallback to legacy string if relation missing
        },
        criteria
    };
};
