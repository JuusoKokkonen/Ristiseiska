import type { Card, TableSuit } from "./types";
import type { Player } from "./player";

// Check if card can be played
export const canPlayCard = (card: Card, table: TableSuit[]) => {
  const suitPile = table.find(t => t.suit === card.suit);

  // 7 of each suit must be played first
  if (!suitPile) {
    return card.rank === 7;
  }

  const ranksOnTable = suitPile.cards.map(c => c.rank);

  // 7 must be on table before 6 and 8
  if (!ranksOnTable.includes(7)) return false;

  const has6 = ranksOnTable.includes(6);
  const has8 = ranksOnTable.includes(8);

// 6 and 8 must be on the table before further cards
  if (
    (card.rank < 6 || card.rank > 8) &&
    (!has6 || !has8)
  ) {
    return false;
  }

  const minRank = Math.min(...ranksOnTable);
  const maxRank = Math.max(...ranksOnTable);

  return (
    card.rank === minRank - 1 ||
    card.rank === maxRank + 1
  );
};


export const getPlayableCards = (
  player: Player,
  table: TableSuit[]
): Card[] => {
  return player.hand.filter(card => canPlayCard(card, table));
};

export const hasPlayableCard = (
  player: Player,
  table: TableSuit[]
): boolean => {
  return getPlayableCards(player, table).length > 0;
};

/** Handle end card */
export const isEndCard = (card: Card) =>
  card.rank === 1 || card.rank === 13;