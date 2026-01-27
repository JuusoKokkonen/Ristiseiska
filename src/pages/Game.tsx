import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { createInitialGameState, type GameState } from "../game/gamestate";
import type { Card, TableSuit } from "../game/types";
import type { Player } from "../game/player";
import { createDeck, shuffleDeck, dealCards } from "../game/deck";
import { isEndCard, canPlayCard, hasPlayableCard, getPlayableCards } from "../game/rules";
import PlayingCard from "../components/PlayingCard";

export default function Game() {
  const location = useLocation();
  const [gameLog, setGameLog] = React.useState<string[]>([]);
  const { gameCode, humanPlayers, aiPlayers } = location.state as {
    gameCode: string;
    humanPlayers: number;
    aiPlayers: number;
  };

  // Game state
  const [gameState, setGameState] = React.useState<GameState>(() => {
    const state = createInitialGameState(gameCode, humanPlayers, aiPlayers);
    const deck = shuffleDeck(createDeck());
    const playersWithCards = dealCards(state.players, deck);

    return {
      ...state,
      players: playersWithCards,
      phase: "playing",
    };
  });

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  // Check winner
  const checkWin = (players: Player[]) => {
    const winner = players.find((p) => p.hand.length === 0);
    if (winner) {
      alert(`${winner.name} voitti pelin! 🎉`);
      return true;
    }
    return false;
  };

  const addToLog = (entry: string) => {
    setGameLog((prev) => [entry, ...prev.slice(0, 4)]);
  };

  const playInitialCrossSevenIfNeeded = () => {
    setGameState((prev) => {
      // jos pöydässä on jo kortteja → skip
      if (prev.table.length > 0) return prev;

      const crossSevenPlayerIndex = prev.players.findIndex((p) =>
        p.hand.some((c) => c.suit === "clubs" && c.rank === 7),
      );

      if (crossSevenPlayerIndex === -1) return prev;

      const player = prev.players[crossSevenPlayerIndex];
      const crossSeven = player.hand.find(
        (c) => c.suit === "clubs" && c.rank === 7,
      )!;

      addToLog(`${player.name} Had 7 of clubs`);

      const newPlayers = [...prev.players];
      newPlayers[crossSevenPlayerIndex] = {
        ...player,
        hand: player.hand.filter((c) => c !== crossSeven),
      };

      const newTable: TableSuit[] = [{ suit: "clubs", cards: [crossSeven] }];

      return {
        ...prev,
        table: newTable,
        players: newPlayers,
        currentPlayerIndex: (crossSevenPlayerIndex + 1) % prev.players.length,
      };
    });
  };

  // Human player

  const playCard = (card: Card) => {
    if (currentPlayer.type !== "human") return;
    if (!canPlayCard(card, gameState.table)) return;

    addToLog(`${currentPlayer.name} played ${card.rank} of ${card.suit}`);

    setGameState((prev) => {
      const newTable = [...prev.table];
      let newPile = newTable.find((t) => t.suit === card.suit);
      if (!newPile) {
        newPile = { suit: card.suit, cards: [] };
        newTable.push(newPile);
      }
      newPile.cards.push(card);

      const newPlayers = [...prev.players];
      newPlayers[prev.currentPlayerIndex] = {
        ...currentPlayer,
        hand: currentPlayer.hand.filter((c) => c !== card),
      };

      const playedEndCard = isEndCard(card);
const stillHasPlayable = hasPlayableCard(
  newPlayers[prev.currentPlayerIndex],
  newTable
);

const nextIndex =
  playedEndCard && stillHasPlayable
    ? prev.currentPlayerIndex
    : (prev.currentPlayerIndex + 1) % newPlayers.length;
      

      if (checkWin(newPlayers)) return prev;

      return {
        ...prev,
        table: newTable,
        players: newPlayers,
        currentPlayerIndex: nextIndex,
      };
    });
  };

  useEffect(() => {
    playInitialCrossSevenIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AI

  const playAICard = (
    aiIndex: number,
    players: Player[],
    table: TableSuit[],
  ) => {
    const ai = players[aiIndex];
    const playableCards = getPlayableCards(ai, table);
    const cardToPlay = playableCards[0] ?? null;

    if (!cardToPlay) {
      addToLog(`${ai.name} took the pantti`);
      setGameState((prev) => ({
        ...prev,
        panttiPlayerId: currentPlayer.id,
        currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length,
      }));
      return;
    }

    addToLog(`${ai.name} played ${cardToPlay.rank} of ${cardToPlay.suit}`);

    setGameState((prev) => {
      const newTable = [...table];
      let newPile = newTable.find((t) => t.suit === cardToPlay.suit);
      if (!newPile) {
        newPile = { suit: cardToPlay.suit, cards: [] };
        newTable.push(newPile);
      }
      newPile.cards.push(cardToPlay);

      const newPlayers = [...players];
      newPlayers[aiIndex] = {
        ...ai,
        hand: ai.hand.filter((c) => c !== cardToPlay),
      };

      const nextIndex = (aiIndex + 1) % newPlayers.length;

      if (checkWin(newPlayers)) return prev;

      return {
        ...prev,
        table: newTable,
        players: newPlayers,
        currentPlayerIndex: nextIndex,
      };
    });
  };

  // Reactive AI handling
  useEffect(() => {
    const current = gameState.players[gameState.currentPlayerIndex];
    if (current.type === "ai") {
      const timer = setTimeout(() => {
        playAICard(
          gameState.currentPlayerIndex,
          gameState.players,
          gameState.table,
        );
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayerIndex, gameState.players, gameState.table]);

  // Passing turn
  const canPass = !hasPlayableCard(currentPlayer, gameState.table);

  const passTurn = () => {
    if (!canPass) {
      alert("Et voi passata – sinulla on pelattava kortti!");
      return;
    }

    addToLog(`${currentPlayer.name} took the pantti`);
    setGameState((prev) => ({
      ...prev,
      panttiPlayerId: currentPlayer.id,
      currentPlayerIndex: (prev.currentPlayerIndex + 1) % prev.players.length,
    }));
  };

  const getTopCard = (cards: Card[]) =>
    cards
      .filter((c) => c.rank > 7)
      .sort((a, b) => a.rank - b.rank)
      .at(-1) || null;

  const getBottomCard = (cards: Card[]) =>
    cards
      .filter((c) => c.rank < 7)
      .sort((a, b) => b.rank - a.rank)
      .at(-1) || null;

  const getSeven = (cards: Card[]) => cards.find((c) => c.rank === 7) || null;

  // UI

  return (
    <div>
      <h2>Ristiseiska</h2>
      <p>Game code: {gameState.gameCode}</p>
      <p>
        Current player: {currentPlayer.name} ({currentPlayer.type})
      </p>

      <h3>Table</h3>

      {gameState.table.length === 0 ? (
        <p>Pöytä tyhjä</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${gameState.table.length}, 70px)`,
            gridTemplateRows: "100px 100px 100px",
            gap: 25,
            justifyContent: "center",
          }}
        >
          {/* YLÄRIVI (8 → K) */}
          {gameState.table.map((t) => (
            <PlayingCard
              key={t.suit + "top"}
              card={getTopCard(t.cards) || undefined}
              hidden={!getTopCard(t.cards)}
            />
          ))}

          {/* SEISKAT */}
          {gameState.table.map((t) => (
            <PlayingCard
              key={t.suit + "seven"}
              card={getSeven(t.cards) || undefined}
            />
          ))}

          {/* ALARIVI (6 → A) */}
          {gameState.table.map((t) => (
            <PlayingCard
              key={t.suit + "bottom"}
              card={getBottomCard(t.cards) || undefined}
              hidden={!getBottomCard(t.cards)}
            />
          ))}
        </div>
      )}

      {currentPlayer.type === "human" && (
        <>
          <h3>Your hand</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {currentPlayer.hand.map((c, idx) => {
              const playable = canPlayCard(c, gameState.table);

              return (
                <PlayingCard
                  key={idx}
                  card={c}
                  playable={playable}
                  onClick={() => playable && playCard(c)}
                />
              );
            })}
          </div>

          <div style={{ marginTop: 10 }}>
            <button onClick={passTurn} disabled={!canPass}>
              Pass
            </button>
          </div>
        </>
      )}

      <h3>All players</h3>
      <ul>
        {gameState.players.map((p, i) => (
          <li key={p.id}>
            {i === gameState.currentPlayerIndex ? "👉 " : ""}
            {p.name} ({p.type}) – {p.hand.length} cards
            {gameState.panttiPlayerId === p.id && " (pantti +25)"}
          </li>
        ))}
      </ul>

      <h3>Game Log</h3>
      <ul>
        {gameLog.map((entry, idx) => (
          <li key={idx}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}
