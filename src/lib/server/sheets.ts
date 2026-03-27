import { env } from '$env/dynamic/private';
import { google } from 'googleapis';
import { prisma } from '$lib/server/prisma';

function getSheets() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: env.SHEETS_CLIENT_EMAIL,
            private_key: env.SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth });
}

/**
 * Rebuild and overwrite the full scores sheet from current DB state.
 * Called after every score or comment submission.
 *
 * Sheet layout:
 * Row 1: Headers — Project | Table | Track | Judge | <criterion names...> | Comment | Submitted At
 * Row 2+: One row per (project, judge) judgement
 */
export async function syncJudgingSheet(): Promise<void> {
    const spreadsheetId = env.SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId || !env.SHEETS_CLIENT_EMAIL || !env.SHEETS_PRIVATE_KEY) {
        console.error("Sheets is not configured");
        return;
    }

    const sheets = getSheets();

    // Fetch all data needed
    const [criteria, projects] = await Promise.all([
        prisma.judgingCriterion.findMany({ orderBy: { order: 'asc' } }),
        prisma.project.findMany({
            include: {
                Track: true,
                judgements: {
                    include: {
                        scores: { include: { criterion: true } },
                        user: { select: { name: true, curve: true } },
                    },
                },
            },
            orderBy: { tableNumber: 'asc' },
        }),
    ]);

    // Build header row
    const criterionHeaders = criteria.map(c => c.name);
    const headers = ['Project', 'Table', 'Track', 'Judge', ...criterionHeaders, 'Comment', 'Submitted At'];

    // Build data rows
    const rows: (string | number)[][] = [];

    for (const project of projects) {
        const trackName = project.Track?.name || project.track || 'General';

        if (project.judgements.length === 0) {
            rows.push([
                project.name,
                project.tableNumber ?? '',
                trackName,
                '',
                ...criteria.map(() => ''),
                '',
                '',
            ]);
        } else {
            for (const judgement of project.judgements) {
                const curve = judgement.user.curve ?? 0;
                const scoresByCriterion = new Map(judgement.scores.map(s => [s.criterionId, s.score]));
                const scoreValues = criteria.map(c => {
                    const raw = scoresByCriterion.get(c.id);
                    return raw !== undefined ? raw + curve : '';
                });

                rows.push([
                    project.name,
                    project.tableNumber ?? '',
                    trackName,
                    judgement.user.name ?? '',
                    ...scoreValues,
                    judgement.comment ?? '',
                    judgement.updatedAt.toISOString(),
                ]);
            }
        }
    }

    const SHEET_ROWS = 500;
    const emptyRow = Array(headers.length).fill('');
    const values = [headers, ...rows];
    while (values.length < SHEET_ROWS) values.push(emptyRow);

    await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        requestBody: { values },
    });
}
