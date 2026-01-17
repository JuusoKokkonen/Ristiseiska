import type { Card, TableSuit } from "./types";
import type { Player } from "./player";

/**
 * Tarkistaa voiko yksittäisen kortin pelata nykyiseen pöytään
 */
export const canPlayCard = (card: Card, table: TableSuit[]) => {
  const suitPile = table.find(t => t.suit === card.suit);

  // Jos maata ei ole vielä pöydässä → vain 7 sallittu
  if (!suitPile) {
    return card.rank === 7;
  }

  const ranksOnTable = suitPile.cards.map(c => c.rank);

  // 7 pitää aina olla
  if (!ranksOnTable.includes(7)) return false;

  const has6 = ranksOnTable.includes(6);
  const has8 = ranksOnTable.includes(8);

  // Jos yritetään laajentaa ylös tai alas,
  // vaaditaan että 6 ja 8 on jo pelattu
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


/**
 * Palauttaa kaikki pelaajan pelattavat kortit
 */
export const getPlayableCards = (
  player: Player,
  table: TableSuit[]
): Card[] => {
  return player.hand.filter(card => canPlayCard(card, table));
};

/**
 * Onko pelaajalla yhtään pelattavaa korttia
 */
export const hasPlayableCard = (
  player: Player,
  table: TableSuit[]
): boolean => {
  return getPlayableCards(player, table).length > 0;
};