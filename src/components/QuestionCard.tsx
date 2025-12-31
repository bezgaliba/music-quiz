import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

type QuestionCardProps = {
  title: string;
  categoryId: string;
  style?: React.CSSProperties;
};

const USED_KEY = "usedQuestions";

const QuestionCard: React.FC<QuestionCardProps> = ({
  title,
  categoryId,
  style,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [used, setUsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USED_KEY) || "[]";
      const arr = JSON.parse(raw) as string[];
      setUsed(new Set(arr));
    } catch {
      setUsed(new Set());
    }
  }, [location.pathname]);
  const allUsed = () => {
    const keys = [`${categoryId}:30`, `${categoryId}:40`, `${categoryId}:50`];
    return keys.every((k) => used.has(k));
  };

  const markUsed = (qid: string) => {
    const key = `${categoryId}:${qid}`;
    if (used.has(key)) return;
    const next = new Set(used);
    next.add(key);
    setUsed(next);
    try {
      localStorage.setItem(USED_KEY, JSON.stringify(Array.from(next)));
    } catch (e) {
      console.error("Error saving used questions:", e);
    }
  };

  const handleClick = (qid: string) => {
    markUsed(qid);
    navigate(`/question/${categoryId}/${qid}`);
  };

  const renderChoice = (qid: string) => {
    const key = `${categoryId}:${qid}`;
    const isUsed = used.has(key);
    return (
      <button
        key={qid}
        className={`choice ${isUsed ? "used" : ""}`}
        onClick={() => handleClick(qid)}
        aria-pressed={isUsed}
      >
        {qid}
      </button>
    );
  };

  return (
    <div className="card" style={style}>
      <div className={`card-title ${allUsed() ? "title-used" : ""}`}>
        <span className="title-text">{title}</span>
      </div>
      <div className="card-choices">
        {renderChoice("30")}
        {renderChoice("40")}
        {renderChoice("50")}
      </div>
    </div>
  );
};

export default QuestionCard;
