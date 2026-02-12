import type { Player } from "./player";
import type { Card } from "./types";

function cardValue(card: Card): number {
  if (card.rank === 1) return 14; // Ace 14 points
  return card.rank;
}

export function calculateScores(
  players: Player[],
  panttiPlayerId: string | null,
): Record<string, number> {
  const scores: Record<string, number> = {};

  for (const player of players) {
    const handPoints = player.hand.reduce(
      (sum, card) => sum + cardValue(card),
      0,
    );

    scores[player.id] =
      handPoints + (player.id === panttiPlayerId ? 25 : 0);
  }

  return scores;
}
