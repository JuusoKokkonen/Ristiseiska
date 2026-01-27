import type { TableSuit } from "./types";
import type { Player } from "./player";
import { createDeck, shuffleDeck, dealCards } from "./deck";

export type GamePhase =
  | "setup"
  | "playing"
  | "finished";

export type GameState = {
  gameCode: string;
  players: Player[];
  table: TableSuit[];
  currentPlayerIndex: number;
  phase: GamePhase;
  panttiPlayerId?: string;
};

import { createPlayer } from "./player";

export function createInitialGameState(
  gameCode: string,
  humanPlayers: number,
  aiPlayers: number
) {
  const players = [];

  for (let i = 0; i < humanPlayers; i++) {
    players.push(createPlayer(`Player ${i + 1}`, "human"));
  }

  for (let i = 0; i < aiPlayers; i++) {
    players.push(createPlayer(`AI ${i + 1}`, "ai"));
  }

  // --- 1. Luo pakka ja sekoita ---
  const deck = shuffleDeck(createDeck());

  // --- 2. Jaa kortit pelaajille ---
  const playersWithCards = dealCards(players, deck);

  // --- 3. Aloittava pelaaja (jolla on 7) ---
  const startingPlayerIndex = playersWithCards.findIndex(p =>
    p.hand.some(c => c.rank === 7)
  );

  return {
    gameCode,
    players: playersWithCards,
    table: [], // alussa tyhjä
    currentPlayerIndex: startingPlayerIndex >= 0 ? startingPlayerIndex : 0,
    phase: "playing",
    panttiPlayerId: undefined,
  };
}
