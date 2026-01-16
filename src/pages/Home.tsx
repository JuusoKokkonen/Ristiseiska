import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1>Ristiseiska</h1>

      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button onClick={() => navigate("/create")}>
          Create Game
        </button>

        <button onClick={() => navigate("/join")}>
          Join Game
        </button>
      </div>
    </div>
  );
}