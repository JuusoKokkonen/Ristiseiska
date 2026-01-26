import type { Card } from "../game/types";

type Props = {
  card?: Card;
  playable?: boolean;
  onClick?: () => void;
  hidden?: boolean;
};

const CARD_WIDTH = 70;
const CARD_HEIGHT = 100;

const suitSymbols: Record<Card["suit"], string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const suitColors: Record<Card["suit"], string> = {
  hearts: "red",
  diamonds: "red",
  clubs: "black",
  spades: "black",
};

export default function PlayingCard({
  card,
  playable = false,
  onClick,
  hidden = false,
}: Props) {
  if (hidden) {
    // Placeholder kortti → pitää gridin linjassa
    return (
      <div
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        }}
      />
    );
  }

  if (!card) return null;

  return (
    <div
      onClick={playable ? onClick : undefined}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 8,
        border: "1px solid #333",
        backgroundColor: "#fff",
        boxShadow: playable
          ? "0 4px 8px rgba(0, 0, 0, 0.25)"
          : "0 2px 4px rgba(0,0,0,0.15)",
        cursor: playable ? "pointer" : "default",
        opacity: playable ? 1 : 0.5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 6,
        userSelect: "none",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      {/* Yläkulma */}
      <div
        style={{
          fontSize: 14,
          fontWeight: "bold",
          alignSelf: "flex-start",
          color: suitColors[card.suit],
        }}
      >
        {card.rank} {suitSymbols[card.suit]}
      </div>

      {/* Keskisymboli */}
      <div
        style={{
          fontSize: 28,
          textAlign: "center",
          color: suitColors[card.suit],
        }}
      >
        {suitSymbols[card.suit]}
      </div>

      {/* Alakulma */}
      <div
        style={{
          fontSize: 14,
          fontWeight: "bold",
          color: suitColors[card.suit],
          alignSelf: "flex-end",
          transform: "rotate(180deg)",
        }}
      >
        {card.rank} {suitSymbols[card.suit]}
      </div>
    </div>
  );
}
