import { prisma } from "$lib/server/prisma";
import type { PageServerLoad } from "./$types";

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
