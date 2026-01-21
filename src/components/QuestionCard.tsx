import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  QuestionMeta,
  deriveQuestionKey,
  pointsForQuestion,
} from "../utils/questions";

type QuestionCardProps = {
  title: string;
  categoryId: string;
  questions: QuestionMeta[];
  style?: React.CSSProperties;
};

const USED_KEY = "usedQuestions";

const QuestionCard: React.FC<QuestionCardProps> = ({
  title,
  categoryId,
  questions,
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
  const entries = useMemo(
    () =>
      (questions ?? []).map((q, idx) => ({
        key: deriveQuestionKey(q, idx),
        points: pointsForQuestion(q, idx),
      })),
    [questions],
  );

  const allUsed = () => {
    const keys = entries.map((e) => `${categoryId}:${e.key}`);
    return keys.length > 0 && keys.every((k) => used.has(k));
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

  const renderChoice = (qid: string, idx: number, points: number) => {
    const key = `${categoryId}:${qid}`;
    const isUsed = used.has(key);
    return (
      <button
        key={qid}
        className={`choice choice-${qid} ${isUsed ? "used" : ""}`}
        onClick={() => handleClick(qid)}
        aria-pressed={isUsed}
        aria-label={`${title} question ${idx + 1} (${points} points)`}
      >
        {points}
      </button>
    );
  };

  return (
    <div className="card" style={style}>
      <div
        className={`card-title ${allUsed() ? "title-used" : ""} ${categoryId === "special" ? "special-title" : ""}`}
      >
        <span className="title-text">{title}</span>
      </div>
      <div
        className={`card-choices ${categoryId === "special" ? "special-card" : ""}`}
      >
        {entries.map((entry, idx) =>
          renderChoice(entry.key, idx, entry.points),
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
