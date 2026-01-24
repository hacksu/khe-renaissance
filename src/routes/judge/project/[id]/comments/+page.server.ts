import { prisma } from '$lib/server/prisma';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const project = await prisma.project.findUnique({
        where: { id: params.id },
        select: { name: true, tableNumber: true }
    });
    return { project };
};

export const actions: Actions = {
    saveComment: async ({ request, locals, params }) => {
        const { auth } = await import('$lib/server/auth');
        const session = await auth.api.getSession(request);
        if (!session) return fail(401);
        const userId = session.user.id;
        const projectId = params.id;

        if (!projectId) return fail(400, { message: "Missing project ID" });

        const form = await request.formData();
        const comment = form.get('comment') as string;

        try {
            // Update Judgement
            await prisma.judgement.update({
                where: {
                    userId_projectId: { userId, projectId }
                },
                data: {
                    comment: comment || null
                }
            });

            // Mark Assignment as Completed
            await prisma.judgeAssignment.update({
                where: {
                    userId_projectId: { userId, projectId }
                },
                data: {
                    status: 'completed'
                }
            });

        } catch (e) {
            console.error(e);
            return fail(500, { message: "Failed to save comment" });
        }

        throw redirect(303, `/judge/project/${projectId}/submitted`);
    }
};
