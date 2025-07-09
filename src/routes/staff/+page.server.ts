import { prisma } from "$lib/server/prisma";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ request, parent }) => {
    const applications = await prisma.application.findMany({
        include: {
            user: true
        }
    });
    return { applications };
};