import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { Judging } from '$lib/server/judging';
import { sendProjectFeedbackEmails } from '$lib/server/email';
import { prisma } from '$lib/server/prisma';

export const load: PageServerLoad = async () => {
    const { results, optionalCriteria } = await Judging.getAllProjectScores();
    return { results, optionalCriteria };
};

export const actions: Actions = {
    clearAll: async () => {
        try {
            await Judging.clearAllScores();
        } catch (e) {
            return fail(500, { message: "Failed to clear scores" });
        }
    },
    sendFeedback: async () => {
        try {
            const projects = await prisma.project.findMany({ select: { id: true } });
            await Promise.all(projects.map(p => sendProjectFeedbackEmails(p.id)));
        } catch (e) {
            return fail(500, { message: 'Failed to send feedback emails' });
        }
    }
};
