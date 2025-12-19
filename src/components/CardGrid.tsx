import React from "react";
import QuestionCard from "./QuestionCard";
import data from "../data/questions.json";

const categories = data.categories as { id: string; title: string }[];

const CardGrid: React.FC = () => {
  return (
    <div className="grid">
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
