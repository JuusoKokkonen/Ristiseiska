export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

export type Rank =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7
  | 8 | 9 | 10 | 11 | 12 | 13;

export type Card = {
  suit: Suit;
  rank: Rank;
};

export type TableSuit = {
  suit: Card["suit"];
  cards: Card[];
};