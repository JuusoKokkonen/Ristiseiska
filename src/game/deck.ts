import type { Card, Suit, Rank } from "./types";
import type { Player } from "./player";

export function createDeck(): Card[] {
  const suits: Suit[] = ["hearts", "diamonds", "clubs", "spades"];
  const ranks: Rank[] = [1,2,3,4,5,6,7,8,9,10,11,12,13];

  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }

  return deck;
}

/* Shuffle (Fisher–Yates shuffle) */
export function shuffleDeck(deck: Card[]): Card[] {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
}

export function dealCards(players: Player[], deck: Card[]): Player[] {
  const hands: Card[][] = players.map(() => []);

  let i = 0;
  for (const card of deck) {
    hands[i % players.length].push(card);
    i++;
  }

  return players.map((p, index) => ({
    ...p,
    hand: hands[index].sort(compareCards),
  }));
}

/* Order cards in hand (optional) */
function compareCards(a: Card, b: Card) {
  if (a.suit === b.suit) return a.rank - b.rank;
  return suitOrder(a.suit) - suitOrder(b.suit);
}

function suitOrder(suit: Suit) {
  switch(suit) {
    case "hearts": return 0;
    case "diamonds": return 1;
    case "clubs": return 2;
    case "spades": return 3;
  }
}