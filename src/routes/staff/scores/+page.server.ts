import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { Judging } from '$lib/server/judging';
import { sendJudgeFeedbackEmail } from '$lib/server/email';

export const load: PageServerLoad = async () => {
    const results = await Judging.getAllProjectScores();
    return { results };
};

export const actions: Actions = {
    clearAll: async ({ request }) => {
        // Double check intent? Ideally UI has confirmation.
        try {
            await Judging.clearAllScores();
        } catch (e) {
            return fail(500, { message: "Failed to clear scores" });
        }
    },
    emailResults: async ({ request }) => {
        try {
            const projects = await Judging.getProjectsWithFeedback();

            // Iterate and send emails
            for (const project of projects) {
                if (project.emails.length === 0) continue;

                // Format Feedback
                let feedbackText = "";
                let feedbackHtml = "";

                if (project.feedbacks.length === 0) {
                    feedbackText = "No feedback was recorded for this project.";
                    feedbackHtml = "<p>No feedback was recorded for this project.</p>";
                } else {
                    for (const feedback of project.feedbacks) {
                        feedbackText += `\n${feedback.judgeLabel}:\n`;
                        feedbackHtml += `<h3>${feedback.judgeLabel}</h3>`;

                        // Scores
                        feedbackText += "Scores:\n";
                        feedbackHtml += "<h4>Scores</h4><ul>";
                        for (const s of feedback.scores) {
                            feedbackText += `- ${s.name}: ${s.value}/${s.max}\n`;
                            feedbackHtml += `<li><strong>${s.name}</strong>: ${s.value}/${s.max}</li>`;
                        }
                        feedbackHtml += "</ul>";

                        // Comment
                        if (feedback.comment) {
                            feedbackText += `Comment: ${feedback.comment}\n`;
                            feedbackHtml += `<h4>Comment</h4><p>${feedback.comment}</p>`;
                        }

                        feedbackText += "\n--------------------------------\n";
                        feedbackHtml += "<hr>";
                    }
                }

                // Send to all members
                // We do this concurrently for the team
                await Promise.all(project.emails.map(email =>
                    sendJudgeFeedbackEmail(email, project.name, feedbackText, feedbackHtml)
                ));
            }

            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { message: "Failed to send emails" });
        }
    }
};
