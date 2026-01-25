import React from "react";
import type { Card } from "../game/types";

type PlayingCardProps = {
  card: Card;
  playable?: boolean;
  onClick?: () => void;
  small?: boolean; // pöytää varten
};

const suitSymbols: Record<Card["suit"], string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const suitColors: Record<Card["suit"], string> = {
  hearts: "#d00",
  diamonds: "#d00",
  clubs: "#000",
  spades: "#000",
};

const rankLabel = (rank: number) => {
  if (rank === 1) return "A";
  if (rank === 11) return "J";
  if (rank === 12) return "Q";
  if (rank === 13) return "K";
  return rank.toString();
};

export default function PlayingCard({
  card,
  playable = false,
  onClick,
  small = false,
}: PlayingCardProps) {
  const color = suitColors[card.suit];

  return (
    <div
      onClick={playable ? onClick : undefined}
      style={{
        width: small ? 50 : 70,
        height: small ? 70 : 100,
        borderRadius: 8,
        backgroundColor: "#fff",
        border: playable ? "2px solid #2ecc71" : "1px solid #333",
        boxShadow: playable
          ? "0 4px 8px rgba(0,0,0,0.3)"
          : "0 2px 4px rgba(0,0,0,0.2)",
        cursor: playable ? "pointer" : "default",
        opacity: playable ? 1 : 0.6,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 6,
        userSelect: "none",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        transform: playable ? "translateY(0)" : undefined,
      }}
      onMouseEnter={e => {
        if (playable) e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Yläkulma */}
      <div style={{ color, fontSize: small ? 12 : 14, fontWeight: 600 }}>
        {rankLabel(card.rank)}
        {suitSymbols[card.suit]}
      </div>

      {/* Keskiosa */}
      <div
        style={{
          textAlign: "center",
          fontSize: small ? 24 : 36,
          color,
          lineHeight: 1,
        }}
      >
        {suitSymbols[card.suit]}
      </div>

      {/* Alakulma */}
      <div
        style={{
          color,
          fontSize: small ? 12 : 14,
          fontWeight: 600,
          alignSelf: "flex-end",
          transform: "rotate(180deg)",
        }}
      >
        {rankLabel(card.rank)}
        {suitSymbols[card.suit]}
      </div>
    </div>
  );
}
