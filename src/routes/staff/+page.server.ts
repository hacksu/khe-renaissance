import { prisma } from "$lib/server/prisma";
import type { Actions, PageServerLoad } from "./$types";
import { sendApprovalEmail } from "$lib/server/email";

export const actions: Actions = {
    approve: async ({ request }) => {
        const form = await request.formData();
        const id = form.get("id") as string;

        if (!id) {
            return;
        }

        const application = await prisma.application.findFirst({
            where: { id },
            include: { user: true }
        });

        if (!application) {
            return;
        }

        const newApprovedStatus = !application.approved;

        await prisma.application.update({
            where: { id },
            data: { approved: newApprovedStatus }
        });

        if (newApprovedStatus) {
            await sendApprovalEmail(application.email);
        }
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


