import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding metadata...');

    // --- Tracks ---
    const tracks = [
        { name: 'General', description: 'General track for all projects' },
        { name: 'Business Analytics', description: 'Data driven business solutions' },
        { name: 'Education Tech', description: 'Improving education through technology' },
        { name: 'Healthcare', description: 'Health and wellness solutions' },
        { name: 'Consumer', description: 'Consumer facing products' },
        { name: 'New Frontiers', description: 'Experimental and cutting edge tech' },
    ];

    for (const t of tracks) {
        await prisma.track.upsert({
            where: { name: t.name },
            update: {},
            create: t,
        });
    }
    console.log('Tracks seeded.');

    // --- Criteria ---
    const criteria = [
        { slug: 'creativity', name: 'Creativity', order: 1, maxScore: 5 },
        { slug: 'mostLearned', name: 'Most Learned', order: 2, maxScore: 5 },
        { slug: 'technicality', name: 'Technicality', order: 3, maxScore: 5 },
        { slug: 'overall', name: 'Overall Score', order: 4, maxScore: 5 },
        { slug: 'trackFit', name: 'Track Fit', order: 5, maxScore: 5 },
    ];

    for (const c of criteria) {
        await prisma.judgingCriterion.upsert({
            where: { slug: c.slug },
            update: {},
            create: c,
        });
    }
    console.log('Criteria seeded.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
