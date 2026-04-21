import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { prisma } from "$lib/server/prisma";
import { sendReminderSignupConfirmation } from "$lib/server/email";

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
