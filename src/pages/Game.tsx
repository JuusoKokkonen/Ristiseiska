import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { createInitialGameState, type GameState } from "../game/gamestate";
import type { Card, TableSuit } from "../game/types";
import type { Player } from "../game/player";
import { createDeck, shuffleDeck, dealCards } from "../game/deck";

export default function Game() {
  const location = useLocation();
  const [gameLog, setGameLog] = React.useState<string[]>([]);
  const { gameCode, humanPlayers, aiPlayers } = location.state as {
    gameCode: string;
    humanPlayers: number;
    aiPlayers: number;
  };

  // --- Game state ---
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

  // --- Tarkista voittaja ---
  const checkWin = (players: Player[]) => {
    const winner = players.find(p => p.hand.length === 0);
    if (winner) {
      alert(`${winner.name} voitti pelin! 🎉`);
      return true;
    }
    return false;
  };

  // --- Päivitä logi ---
  const addToLog = (entry: string) => {
    setGameLog(prev => [entry, ...prev.slice(0, 4)]); // viimeiset 5
  };

  // --- Kortin pelaaminen ihmispelaajan toimesta ---
  const playCard = (card: Card) => {
    if (currentPlayer.type !== "human") return;

    const suitPile = gameState.table.find(t => t.suit === card.suit);
    let canPlay = false;

    if (!suitPile) {
      if (card.rank === 7) canPlay = true;
    } else {
      const minRank = Math.min(...suitPile.cards.map(c => c.rank));
      const maxRank = Math.max(...suitPile.cards.map(c => c.rank));
      if (card.rank === minRank - 1 || card.rank === maxRank + 1) canPlay = true;
    }

    if (!canPlay) {
      alert("Korttia ei voi pelata sääntöjen mukaan!");
      return;
    }

    // --- Lisää logiin ---
    addToLog(`${currentPlayer.name} played ${card.rank} of ${card.suit}`);

    setGameState(prev => {
      const newTable = [...prev.table];
      let newPile = newTable.find(t => t.suit === card.suit);
      if (!newPile) {
        newPile = { suit: card.suit, cards: [] };
        newTable.push(newPile);
      }
      newPile.cards.push(card);

      const newPlayers = [...prev.players];
      newPlayers[prev.currentPlayerIndex] = {
        ...currentPlayer,
        hand: currentPlayer.hand.filter(c => c !== card),
      };

      const nextIndex = (prev.currentPlayerIndex + 1) % newPlayers.length;

      // Tarkista voittaja
      if (checkWin(newPlayers)) return prev;

      return {
        ...prev,
        table: newTable,
        players: newPlayers,
        currentPlayerIndex: nextIndex,
      };
    });
  };

  // --- AI:n siirtofunktio ---
  const playAICard = (aiIndex: number, players: Player[], table: TableSuit[]) => {
    const ai = players[aiIndex];
    let cardToPlay: Card | null = null;

    for (const c of ai.hand) {
      const suitPile = table.find(t => t.suit === c.suit);
      if (!suitPile && c.rank === 7) {
        cardToPlay = c;
        break;
      } else if (suitPile) {
        const minRank = Math.min(...suitPile.cards.map(cc => cc.rank));
        const maxRank = Math.max(...suitPile.cards.map(cc => cc.rank));
        if (c.rank === minRank - 1 || c.rank === maxRank + 1) {
          cardToPlay = c;
          break;
        }
      }
    }

    if (!cardToPlay) {
      // Passaa AI
      addToLog(`${ai.name} passed`);
      setGameState(prev => {
        const nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
        return { ...prev, currentPlayerIndex: nextIndex };
      });
      return;
    }

    addToLog(`${ai.name} played ${cardToPlay.rank} of ${cardToPlay.suit}`);

    setGameState(prev => {
      const newTable = [...table];
      let newPile = newTable.find(t => t.suit === cardToPlay!.suit);
      if (!newPile) {
        newPile = { suit: cardToPlay!.suit, cards: [] };
        newTable.push(newPile);
      }
      newPile.cards.push(cardToPlay!);

      const newPlayers = [...players];
      newPlayers[aiIndex] = {
        ...ai,
        hand: ai.hand.filter(c => c !== cardToPlay),
      };

      const nextIndex = (aiIndex + 1) % newPlayers.length;

      // Tarkista voittaja
      if (checkWin(newPlayers)) return prev;

      return {
        ...prev,
        table: newTable,
        players: newPlayers,
        currentPlayerIndex: nextIndex,
      };
    });
  };

  // --- Reaktiivinen AI-käsittely ---
  useEffect(() => {
    const current = gameState.players[gameState.currentPlayerIndex];
    if (current.type === "ai") {
      const timer = setTimeout(() => {
        playAICard(gameState.currentPlayerIndex, gameState.players, gameState.table);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayerIndex, gameState.players, gameState.table]);

  // --- Passausnappi ---
  const passTurn = () => {
    addToLog(`${currentPlayer.name} passed`);
    setGameState(prev => {
      const nextIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      return { ...prev, currentPlayerIndex: nextIndex };
    });
  };

  // --- Funktio pöydän kolmen kasan renderöintiin ---
  const getSuitDisplay = (cards: Card[]) => {
    const left = cards.filter(c => c.rank < 7);
    const seven = cards.find(c => c.rank === 7);
    const right = cards.filter(c => c.rank > 7);

    return {
      left: left.length ? left[left.length - 1] : null,
      center: seven || null,
      right: right.length ? right[right.length - 1] : null,
    };
  };

  return (
    <div>
      <h2>Ristiseiska</h2>
      <p>Game code: {gameState.gameCode}</p>
      <p>Current player: {currentPlayer.name} ({currentPlayer.type})</p>

      <h3>Table</h3>
      {gameState.table.length === 0 ? (
        <p>Pöytä tyhjä</p>
      ) : (
        gameState.table.map(t => {
          const { left, center, right } = getSuitDisplay(t.cards);
          return (
            <div key={t.suit} style={{ marginBottom: "10px" }}>
              <strong>{t.suit.toUpperCase()}:</strong>{" "}
              <span style={{ display: "inline-block", width: 30, height: 45, lineHeight: "45px", textAlign: "center", border: "1px solid black", borderRadius: 4, marginRight: 3, backgroundColor: "#fdd" }}>
                {left?.rank || "-"}
              </span>
              <span style={{ display: "inline-block", width: 30, height: 45, lineHeight: "45px", textAlign: "center", border: "1px solid black", borderRadius: 4, marginRight: 3, backgroundColor: "#fff" }}>
                {center?.rank || "-"}
              </span>
              <span style={{ display: "inline-block", width: 30, height: 45, lineHeight: "45px", textAlign: "center", border: "1px solid black", borderRadius: 4, marginRight: 3, backgroundColor: "#dfd" }}>
                {right?.rank || "-"}
              </span>
            </div>
          );
        })
      )}

      {currentPlayer.type === "human" && (
        <>
          <h3>Your hand</h3>
          {currentPlayer.hand.map((c, idx) => (
            <button key={idx} onClick={() => playCard(c)}>
              {c.rank} {c.suit[0].toUpperCase()}
            </button>
          ))}
          <div style={{ marginTop: "10px" }}>
            <button onClick={passTurn}>Pass</button>
          </div>
        </>
      )}

      <h3>All players</h3>
      <ul>
        {gameState.players.map((p, i) => (
          <li key={p.id}>
            {i === gameState.currentPlayerIndex ? "👉 " : ""}
            {p.name} ({p.type}) - {p.hand.length} cards
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
