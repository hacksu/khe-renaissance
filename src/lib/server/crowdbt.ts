// Crowd-BT update (simplified: ignores judge reliability for v1)
// winner gets: alpha += delta, loser gets: beta += delta
// where delta = (alpha_winner * beta_loser) / (alpha_winner + beta_loser)

export function crowdBTUpdate(
  winner: { alpha: number; beta: number },
  loser: { alpha: number; beta: number }
): { winner: { alpha: number; beta: number }; loser: { alpha: number; beta: number } } {
  const delta = (winner.alpha * loser.beta) / (winner.alpha + loser.beta);
  return {
    winner: { alpha: winner.alpha + delta, beta: winner.beta },
    loser: { alpha: loser.alpha, beta: loser.beta + delta },
  };
}

// Quality score for ranking: expected win probability
export function crowdBTScore(alpha: number, beta: number): number {
  return alpha / (alpha + beta);
}
