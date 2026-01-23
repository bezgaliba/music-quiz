import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionCard from "./QuestionCard";
import data from "../data/questions.json";
import { getRound } from "../gameState";
import { QuestionMeta } from "../utils/questions";

type Category = { id: string; title: string; questions: QuestionMeta[] };

const categories = data.categories as Category[];
const SHOW_SPECIAL_KEY = "showSpecialRound";

const CardGrid: React.FC = () => {
  const navigate = useNavigate();
  const [round, setRound] = useState(1);
  const [showSpecial, setShowSpecial] = useState(false);

  useEffect(() => {
    setRound(getRound());
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SHOW_SPECIAL_KEY);
      if (raw === "true") setShowSpecial(true);
      if (raw === "false") setShowSpecial(false);
    } catch (e) {
      console.error("Failed to read special round toggle:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SHOW_SPECIAL_KEY, showSpecial ? "true" : "false");
    } catch (e) {
      console.error("Failed to persist special round toggle:", e);
    }
  }, [showSpecial]);

  const visibleCategories = showSpecial
    ? categories
    : categories.filter((c) => c.id !== "special");

  return (
    <div className="grid">
      <div
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          fontSize: "3rem",
          fontWeight: 600,
          color: "#fff",
          textShadow:
            "-2px -2px 0 rgba(0,0,0,0.6), 2px -2px 0 rgba(0,0,0,0.6), -2px 2px 0 rgba(0,0,0,0.6), 2px 2px 0 rgba(0,0,0,0.6), 0 6px 18px rgba(0,0,0,0.25)",
        }}
      >
        Round {round}
      </div>
      <button
        className="special-round-btn"
        onClick={() => setShowSpecial((s) => !s)}
      >
        {showSpecial ? "Hide Special" : "Special Round"}
      </button>
      <button className="end-round-btn" onClick={() => navigate("/answers")}>
        End Round
      </button>
      <div className="grid-inner all-rows">
        {visibleCategories.map((c, idx) => {
          const row = Math.floor(idx / 4) + 1;

          const itemsPerRow = 4;
          const fullRows = Math.floor(visibleCategories.length / itemsPerRow);
          const lastRowCount =
            visibleCategories.length - fullRows * itemsPerRow;
          const baseIndex = fullRows * itemsPerRow;

          const style: React.CSSProperties = {};

          if (lastRowCount > 0 && idx >= baseIndex) {
            const posInLast = idx - baseIndex;
            const startCol = Math.floor((itemsPerRow - lastRowCount) / 2) + 1;
            const desiredCol = startCol + posInLast;
            style.gridColumn = `${desiredCol} / span 1`;
            style.gridRow = `${fullRows + 1} / span 1`;
          } else {
            const col = (idx % itemsPerRow) + 1;
            style.gridColumn = `${col} / span 1`;
            style.gridRow = `${row} / span 1`;
          }

          return (
            <QuestionCard
              key={c.id}
              title={c.title}
              categoryId={c.id}
              questions={c.questions ?? []}
              style={style}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CardGrid;
