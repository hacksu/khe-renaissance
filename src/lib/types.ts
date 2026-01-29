export interface Project {
    id: string;
    name: string;
    track: string;
    description: string | null;
    tableNumber: string | null;
    members?: Partial<any>[]; // Circular dependency avoidance for now, or just concise
}

export interface JudgeAssignment {
    id: string;
    userId: string;
    projectId: string;
    status: string; // 'assigned' | 'completed' | 'skipped'
    priority: number;
    project?: Project;
}

export interface Judgement {
    id: string;
    userId: string;
    projectId: string;
    creativity: number;
    mostLearned: number;
    technicality: number;
    overall: number;
    trackFit: number;
    comment: string | null;
    createdAt: Date;
    updatedAt: Date;
}
