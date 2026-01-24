import type { PageServerLoad } from './$types';
import type { JudgeAssignment, Project } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
    // In real DB: await prisma.judgeAssignment.findMany({ where: { userId: session.userId }, include: { project: true } })

    // Mock Data linked to Types
    const assignments: JudgeAssignment[] = [
        {
            id: '1',
            userId: 'mock-judge',
            projectId: '7',
            status: 'completed',
            priority: 0,
            project: { id: '7', name: 'Team #7', track: 'General (Open-Ended)', description: null, tableNumber: null }
        },
        {
            id: '2',
            userId: 'mock-judge',
            projectId: '12',
            status: 'assigned',
            priority: 1,
            project: { id: '12', name: 'Team #12', track: 'Business Analytics', description: null, tableNumber: null }
        },
        {
            id: '3',
            userId: 'mock-judge',
            projectId: '4',
            status: 'assigned',
            priority: 2,
            project: { id: '4', name: 'Team #4', track: 'General (Open-Ended)', description: null, tableNumber: null }
        },
        {
            id: '4',
            userId: 'mock-judge',
            projectId: '9',
            status: 'assigned',
            priority: 0,
            project: { id: '9', name: 'Team #9', track: 'Education Tech', description: null, tableNumber: null }
        },
        {
            id: '5',
            userId: 'mock-judge',
            projectId: '15',
            status: 'assigned',
            priority: 0,
            project: { id: '15', name: 'Team #15', track: 'Healthcare', description: null, tableNumber: null }
        }
    ];

    return {
        assignments
    };
};
