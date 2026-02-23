import { useState } from "react";
import { useNavigate } from "react-router-dom";

type LobbySlot =
  | { type: "empty" }
  | { type: "human"; name: string }
  | { type: "ai"; name: string };

export default function CreateGame() {
  const navigate = useNavigate();

  const [players, setPlayers] = useState<number>(4);
  const [playerName, setPlayerName] = useState<string>("");

  const [slots, setSlots] = useState<LobbySlot[]>([]);

  const [gameCode] = useState(() => generateGameCode());

  function joinGame(index: number) {
    if (!playerName.trim()) {
      alert("Please enter your name first");
      return;
    }

    // only 1 human player for now
    if (slots.some((s) => s.type === "human")) {
      alert("Human player already joined");
      return;
    }

    setSlots((prev) =>
      prev.map((slot, i) =>
        i === index ? { type: "human", name: playerName } : slot
      )
    );
  }

  function addAI(index: number) {
    setSlots((prev) =>
      prev.map((slot, i) =>
        i === index
          ? { type: "ai", name: randomAIName() }
          : slot
      )
    );
  }

    function removePlayer(index: number) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = { type: "empty" };
      return next;
    });
  } 

  function startGame() {
    const humanPlayers = slots.filter((s) => s.type === "human").length;
    const aiPlayers = slots.filter((s) => s.type === "ai").length;

    if (humanPlayers === 0) {
      alert("At least one human player required");
      return;
    }

    navigate("/game", {
      state: {
        gameCode,
        humanPlayers,
        aiPlayers,
        players,
        playerName,
      },
    });
  }

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto" }}>
      <h2>Create Game</h2>

      <label>
        Your name:
        <input
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          style={{ display: "block", width: "100%", marginTop: 4 }}
        />
      </label>

      <br />

      <label>
        Total players:
        <select
  value={players}
  onChange={(e) => {
    const value = Number(e.target.value);
    setPlayers(value);

    setSlots((prev) => {
      const next = [...prev];
      while (next.length < value) next.push({ type: "empty" });
      return next.slice(0, value);
    });
  }}
>
          {range(2, 8).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <br /><br />

      <h3>Lobby</h3>

      {slots.map((slot, index) => (
  <div
    key={index}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      border: "1px solid #ccc",
      padding: "8px",
      marginBottom: "6px",
      borderRadius: 6,
    }}
  >
    <div>
      {slot.type === "empty" && <em>Empty slot</em>}
      {slot.type === "human" && <strong>{slot.name}</strong>}
      {slot.type === "ai" && <strong>AI player</strong>}
    </div>

    <div>
      {slot.type === "empty" ? (
        <>
          <button onClick={() => joinGame(index)}>Join game</button>{" "}
          <button onClick={() => addAI(index)}>Add AI</button>
        </>
      ) : (
        <button onClick={() => removePlayer(index)}>Remove</button>
      )}
    </div>
  </div>
))}

      <br />

      <div>
        <strong>Game code:</strong> {gameCode}
      </div>

      <br />

      <button onClick={startGame}>Start Game</button>
    </div>
  );
}

/* Help functions */

function generateGameCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function range(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

function randomAIName() {
  const names = ["HAL", "DeepBlue", "Skynet", "R2-D2", "Cortana"];
  return names[Math.floor(Math.random() * names.length)];
}
