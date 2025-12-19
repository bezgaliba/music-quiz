import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import data from "../data/questions.json";

const POINTS: Record<string, number> = {
  "1": 30,
  "2": 40,
  "3": 50,
};

const QuestionPage: React.FC = () => {
  const { category, id } = useParams<{ category: string; id: string }>();

  const cat = data.categories.find((c: any) => c.id === category);
  const numericToQid: Record<string, string> = {
    "30": "1",
    "40": "2",
    "50": "3",
  };
  const normalizedId = id && numericToQid[id] ? numericToQid[id] : (id ?? "1");
  const points = POINTS[normalizedId] ?? 0;
  const navigate = useNavigate();

  return (
    <div className="question-page">
      <div className="turntable-container">
        <img
          src="/resources/img/turntable.jpeg"
          alt="Turntable"
          className="turntable-img"
        />
        <div
          className="turntable-overlay"
          onClick={() => navigate(-1)}
          role="button"
          aria-label="Go back"
          style={{ pointerEvents: "auto", cursor: "pointer" }}
        >
          <div className="overlay-title">{cat ? cat.title : ""}</div>
          <div className="overlay-points">{points} points</div>
        </div>
      </div>

      {/* Back link removed: overlay click navigates back now */}
    </div>
  );
};

export default QuestionPage;
