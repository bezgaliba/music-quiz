import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QuestionCard from "./QuestionCard";
import data from "../data/questions.json";

const categories = data.categories as { id: string; title: string }[];

const CardGrid: React.FC = () => {
  const navigate = useNavigate();
  const [round, setRound] = useState(1);

  useEffect(() => {
    const r = parseInt(localStorage.getItem("currentRound") || "1", 10);
    setRound(r);
  }, []);

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
      <button className="end-round-btn" onClick={() => navigate("/answers")}>
        End Round
      </button>
      <div className="grid-inner all-rows">
        {categories.map((c, idx) => {
          const row = Math.floor(idx / 4) + 1;

          const itemsPerRow = 4;
          const fullRows = Math.floor(categories.length / itemsPerRow);
          const lastRowCount = categories.length - fullRows * itemsPerRow;
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
              style={style}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CardGrid;
