import { prisma } from "$lib/server/prisma";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    const staffMembers = await prisma.user.findMany({
        where: { role: "staff" },
        select: { id: true, name: true, email: true, createdAt: true }
    });

    const pendingInvites = await prisma.invite.findMany({
        where: { role: "staff", used: false },
        orderBy: { createdAt: "desc" }
    });

    return { staffMembers, pendingInvites };
};

export const actions: Actions = {
    removeStaff: async ({ request }) => {
        const form = await request.formData();
        const userId = form.get("userId") as string;

        if (!userId) return fail(400, { missing: true });

        try {
            await prisma.user.update({
                where: { id: userId },
                data: { role: "user" }
            });
            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { error: "Failed to remove staff member" });
        }
    },
    revokeInvite: async ({ request }) => {
        const form = await request.formData();
        const inviteId = form.get("inviteId") as string;

        if (!inviteId) return fail(400, { missing: true });

        try {
            await prisma.invite.delete({ where: { id: inviteId } });
            return { success: true };
        } catch (e) {
            console.error(e);
            return fail(500, { error: "Failed to revoke invite" });
        }
    }
};
