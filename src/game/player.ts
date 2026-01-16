import type { Card } from "./types";

export type PlayerType = "human" | "ai";

export type Player = {
  id: string;
  name: string;
  type: PlayerType;
  hand: Card[];
  hasPassed: boolean;
};

export function createPlayer(
  name: string,
  type: PlayerType
): Player {
  return {
    id: crypto.randomUUID(),
    name,
    type,
    hand: [],
    hasPassed: false,
  };
}