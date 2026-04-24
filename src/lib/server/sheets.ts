
/**
 * Sync judging results to Google Sheets.
 *
 * TODO: Reimplement for the new pairwise judging system (PairComparison /
 * CrowdBTState models). The old implementation referenced the removed
 * Judgement / JudgementScore models and has been removed.
 */
export async function syncJudgingSheet(): Promise<void> {
    // No-op until reimplemented for pairwise judging.
    return;
}
