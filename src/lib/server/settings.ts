import { prisma } from '$lib/server/prisma';

export const SETTING_KEYS = {
    MAX_TABLES_PER_JUDGE: 'maxTablesPerJudge'
} as const;

export const Settings = {
    get: async (key: string) => {
        const row = await prisma.setting.findUnique({ where: { key } });
        return row?.value ?? null;
    },

    set: async (key: string, value: string) => {
        await prisma.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
    },

    getMaxTablesPerJudge: async () => {
        const val = await Settings.get(SETTING_KEYS.MAX_TABLES_PER_JUDGE);
        if (val === null) return null;
        const n = parseInt(val);
        return isNaN(n) ? null : n;
    }
};
