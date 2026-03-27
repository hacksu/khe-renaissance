import { prisma } from '$lib/server/prisma';

export const SETTING_KEYS = {
    MAX_TABLES_PER_JUDGE: 'maxTablesPerJudge',
    MAX_JUDGES_PER_TEAM: 'maxJudgesPerTeam',
    TIME_PER_TABLE: 'timePerTable'
} as const;

const getIntSetting = async (key: string) => {
    const row = await prisma.setting.findUnique({ where: { key } });
    if (row === null) return null;
    const n = parseInt(row.value);
    return isNaN(n) ? null : n;
};

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

    getMaxTablesPerJudge: () => getIntSetting(SETTING_KEYS.MAX_TABLES_PER_JUDGE),
    getMaxJudgesPerTeam: () => getIntSetting(SETTING_KEYS.MAX_JUDGES_PER_TEAM),
    getTimePerTable: () => getIntSetting(SETTING_KEYS.TIME_PER_TABLE)
};
