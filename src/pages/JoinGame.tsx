import { useNavigate } from "react-router-dom";

export default function JoinGame() {
    const navigate = useNavigate();
  return (
    <div>
      <h2>Join Game</h2>
      <p>Multiplayer coming soon! "(maybe)"</p>
      <button onClick={() => navigate("/")}>
          back
        </button>
    </div>
  );
}