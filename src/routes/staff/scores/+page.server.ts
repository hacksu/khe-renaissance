import { prisma } from '$lib/server/prisma';
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    // Fetch all projects with their judgements and scores
    const projects = await prisma.project.findMany({
        include: {
            judgements: {
                include: { scores: true }
            },
            Track: true
        }
    });

    // Calculate aggregations
    const results = projects.map(p => {
        const totalScore = p.judgements.reduce((sum, j) => {
            return sum + j.scores.reduce((s, score) => s + score.score, 0);
        }, 0);

        const count = p.judgements.length;
        const average = count > 0 ? (totalScore / count).toFixed(2) : "0.00";

        return {
            id: p.id,
            name: p.name,
            track: p.Track?.name || p.track,
            tableNumber: p.tableNumber,
            judgementCount: count,
            totalScore,
            averageScore: average
        };
    }).sort((a, b) => Number(b.averageScore) - Number(a.averageScore)); // Rank by average

    return { results };
};

export const actions: Actions = {
    clearAll: async ({ request }) => {
        // Double check intent? Ideally UI has confirmation.
        try {
            // Transactional delete?
            // Deleting Judgement Assignments resets queue.
            // Deleting Judgements resets scores.
            await prisma.$transaction([
                prisma.judgement.deleteMany({}),
                prisma.judgeAssignment.deleteMany({}) // Reset assignments too? User asked to "clear judging scores", implies reset.
            ]);
        } catch (e) {
            return fail(500, { message: "Failed to clear scores" });
        }
    }
};
