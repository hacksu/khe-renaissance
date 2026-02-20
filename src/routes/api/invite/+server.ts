import { json, error } from "@sveltejs/kit";
import { auth } from "$lib/server/auth";
import { Role } from "$lib/server/external_roles";
import { prisma } from "$lib/server/prisma";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
    const session = await auth.api.getSession(request);
    if (!session || session.user.role !== Role.STAFF) {
        throw error(403, "Forbidden");
    }

    const { email, role } = await request.json();

    if (!email || !role) {
        throw error(400, "Email and role are required");
    }

    if (role !== Role.JUDGE && role !== Role.STAFF) {
        throw error(400, "Invalid role");
    }

    await prisma.invite.upsert({
        where: { email_role: { email, role } },
        update: { used: false, createdAt: new Date() },
        create: { email, role }
    });

    return json({ success: true });
};
