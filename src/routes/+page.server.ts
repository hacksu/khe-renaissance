import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { prisma } from "$lib/server/prisma";
import { sendReminderSignupConfirmation } from "$lib/server/email";

export const load: PageServerLoad = async () => {
    const [sponsors, prizes] = await Promise.all([
        prisma.sponsor.findMany({ orderBy: { order: 'asc' } }),
        prisma.prize.findMany({ orderBy: { order: 'asc' } }),
    ]);

    return {
        sponsors: {
            baron: sponsors.filter(s => s.tier === 'baron'),
            knight: sponsors.filter(s => s.tier === 'knight'),
            squire: sponsors.filter(s => s.tier === 'squire'),
        },
        prizes: {
            overall: prizes.filter(p => p.category === 'overall'),
            tracks: prizes.filter(p => p.category === 'track'),
            special: prizes.filter(p => p.category === 'special'),
        },
    };
};

export const actions: Actions = {
    subscribe: async ({ request }) => {
        const formData = await request.formData();
        const emailValue = formData.get("email");
        const email = typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";

        if (!email) {
            return fail(400, { error: "Please enter a valid email address." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return fail(400, { error: "Please enter a valid email address." });
        }

        const existing = await prisma.reminderSignup.findUnique({
            where: { email },
        });

        if (existing) {
            return { success: true, alreadySignedUp: true };
        }

        await prisma.reminderSignup.create({
            data: { email },
        });

        await sendReminderSignupConfirmation(email);

        return { success: true, alreadySignedUp: false };
    },
};
