const MAX_STEP = 1.0;
const SURPRISE_SCALE = 4;

function meanScore(alpha: number, beta: number): number {
  return alpha / (alpha + beta);
}

export function crowdBTUpdate(
  winner: { alpha: number; beta: number },
  loser: { alpha: number; beta: number }
): { winner: { alpha: number; beta: number }; loser: { alpha: number; beta: number } } {
  const winnerScore = meanScore(winner.alpha, winner.beta);
  const loserScore = meanScore(loser.alpha, loser.beta);

  const expectedWinProb = 1 / (1 + Math.exp(-SURPRISE_SCALE * (winnerScore - loserScore)));
  const delta = MAX_STEP * (1 - expectedWinProb);

  return {
    winner: { alpha: winner.alpha + delta, beta: winner.beta },
    loser: { alpha: loser.alpha, beta: loser.beta + delta },
  };
}

export function crowdBTScore(alpha: number, beta: number): number {
  return alpha / (alpha + beta);
}
