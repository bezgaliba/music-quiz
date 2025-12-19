import React from "react";
import QuestionCard from "./QuestionCard";
import data from "../data/questions.json";

const categories = data.categories as { id: string; title: string }[];

const CardGrid: React.FC = () => {
  return (
    <div className="grid">
      <h2 className="page-title">Welcome to the Music Quiz!</h2>

      <div className="grid-inner all-rows">
        {categories.map((c, idx) => {
          // general layout: rows of 4
          const row = Math.floor(idx / 4) + 1;

          // compute last-row centering
          const itemsPerRow = 4;
          const fullRows = Math.floor(categories.length / itemsPerRow);
          const lastRowCount = categories.length - fullRows * itemsPerRow; // 0..3
          const baseIndex = fullRows * itemsPerRow; // start index of last row

          const style: React.CSSProperties = {};

          if (lastRowCount > 0 && idx >= baseIndex) {
            // place items of the last row centered
            const posInLast = idx - baseIndex; // 0..lastRowCount-1
            const startCol = Math.floor((itemsPerRow - lastRowCount) / 2) + 1; // 1-based column
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
