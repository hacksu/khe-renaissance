import { prisma } from "$lib/server/prisma";
import type { Actions, PageServerLoad } from "./$types";

export const actions: Actions = {
    approve: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;

        if (!id) {
            return;
        }

        const application = await prisma.application.findFirst({ where: { id }});
        await prisma.application.update({
            where: { id },
            data: { approved: !application?.approved }
        });
    },
    checkIn: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;

        if (!id) {
            return;
        }

        await prisma.application.update({
            where: { id },
            data: { checkedIn: true }
        });
    }
};

export const load: PageServerLoad = async () => {
    const applications = await prisma.application.findMany({
        include: {
            user: true
        }
    });
    return { applications };
};