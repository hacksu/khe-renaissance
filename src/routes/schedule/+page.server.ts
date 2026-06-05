import { prisma } from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const events = await prisma.scheduleEvent.findMany({ orderBy: { order: 'asc' } });
    return { events };
};
