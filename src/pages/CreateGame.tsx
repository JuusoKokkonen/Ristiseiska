import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateGame() {
  const navigate = useNavigate();

  const [players, setPlayers] = useState<number>(4);
  const [aiPlayers, setAiPlayers] = useState<number>(3);

  // Game code luodaan kerran
  const [gameCode] = useState(() => generateGameCode());

  function handlePlayersChange(value: number) {
    setPlayers(value);

    // Varmistetaan että AI-pelaajia ei ole liikaa
    if (aiPlayers >= value) {
      setAiPlayers(value - 1);
    }
  }

  function startGame() {
    navigate("/game", {
      state: {
        players,
        aiPlayers,
        humanPlayers: players - aiPlayers,
        gameCode,
      },
    });
  }

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto" }}>
      <h2>Create Game</h2>

      <label>
        Total players:
        <select
          value={players}
          onChange={(e) => handlePlayersChange(Number(e.target.value))}
        >
          {range(2, 8).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <br /><br />

      <label>
        Computer players:
        <select
          value={aiPlayers}
          onChange={(e) => setAiPlayers(Number(e.target.value))}
        >
          {range(0, players - 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <br /><br />

      <div>
        <strong>Game code:</strong>
        <div style={{ fontSize: "1.2rem", letterSpacing: "0.1em" }}>
          {gameCode}
        </div>
      </div>

      <br />

      <button onClick={startGame}>Start Game</button>
    </div>
  );
}

/* --- apufunktiot --- */

function generateGameCode(): string {
  return Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
}

function range(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}