import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { Judging } from '$lib/server/judging';

export const load: PageServerLoad = async () => {
    const results = await Judging.getAllProjectScores();
    return { results };
};

export const actions: Actions = {
    clearAll: async ({ request }) => {
        try {
            await Judging.clearAllScores();
        } catch (e) {
            return fail(500, { message: "Failed to clear scores" });
        }
    },
    emailResults: async ({ request }) => {
        try {
            const projects = await Judging.getProjectsWithFeedback();
            for (const project of projects) {
                await Judging.sendFeedbackEmailToProject(project);
            }

            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { message: "Failed to send emails" });
        }
    },
    emailTeam: async ({ request }) => {
        const formData = await request.formData();
        const projectId = formData.get('id') as string;

        if (!projectId) return fail(400, { message: "Missing project ID" });

        try {
            const projects = await Judging.getProjectsWithFeedback(projectId);
            if (projects.length === 0) return fail(404, { message: "Project not found" });

            await Judging.sendFeedbackEmailToProject(projects[0]);

            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { message: "Failed to send email to team" });
        }
    }
};
