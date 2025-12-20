import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import data from "../data/questions.json";

const USED_KEY = "usedQuestions";
const ANSWERS_KEY = "answersSession";

const numericToQid: Record<string, string> = {
  "30": "1",
  "40": "2",
  "50": "3",
};

const AnswersPage: React.FC = () => {
  const navigate = useNavigate();
  const [usedKeys, setUsedKeys] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ANSWERS_KEY);
      const parsedStored = stored ? JSON.parse(stored) : null;
      // If there's a non-empty stored session, use it. If it's missing or an empty array,
      // treat that as "no session" and populate from USED_KEY so new rounds rebuild answers.
      if (Array.isArray(parsedStored) && parsedStored.length > 0) {
        setUsedKeys(parsedStored as string[]);
      } else {
        const raw = localStorage.getItem(USED_KEY) || "[]";
        const arr = JSON.parse(raw) as string[];
        setUsedKeys(arr);
        // write session only when we actually populated it from USED_KEY
        try {
          localStorage.setItem(ANSWERS_KEY, JSON.stringify(arr));
        } catch {
          // ignore
        }
      }
      setIndex(0);
    } catch {
      setUsedKeys([]);
    }

    return () => {
      try {
        localStorage.setItem(ANSWERS_KEY, JSON.stringify([]));
      } catch {
        // ignore
      }
      setUsedKeys([]);
      setIndex(0);
    };
  }, []);

  const items = useMemo(() => {
    return usedKeys
      .map((k) => {
        const parts = k.split(":");
        if (parts.length !== 2) return null;
        const [catId, pointsStr] = parts;
        const points = parseInt(pointsStr, 10) || 0;
        const qid = numericToQid[pointsStr];
        const category = data.categories.find((c: any) => c.id === catId);
        if (!category) return null;
        const answer = category.answers?.find((a: any) => a.id === qid);
        return {
          key: k,
          categoryId: catId,
          categoryTitle: category.title,
          points,
          artist: answer?.artist ?? "",
          name: answer?.name ?? "",
        };
      })
      .filter(Boolean) as Array<{
      key: string;
      categoryId: string;
      categoryTitle: string;
      points: number;
      artist: string;
      name: string;
    }>;
  }, [usedKeys]);

  const current =
    items.length > 0 && index >= 0 ? items[index % items.length] : null;

  const handleNext = () => {
    if (items.length === 0) return;
    setIndex((i) => (i + 1) % items.length);
  };

  const handleBack = () => {
    try {
      localStorage.setItem(ANSWERS_KEY, JSON.stringify([]));
    } catch {
      // ignore
    }
    navigate("/");
  };

  return (
    <div
      className="answers-page"
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/resources/img/answersBackground.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <button
        aria-label="Back to cards"
        className="answers-back-btn"
        onClick={handleBack}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
            fill="currentColor"
          />
        </svg>
      </button>

      <div style={{ position: "relative", display: "flex", flex: 1 }}>
        <div
          style={{
            width: "320px",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            alignItems: "flex-start",
          }}
        >
          {items.length === 0 ? (
            <div style={{ color: "white" }}>
              No crossed answers for this round.
            </div>
          ) : (
            items.map((it, i) => (
              <div
                key={it.key}
                style={{
                  color: i === index ? "#fff" : "#ddd",
                  opacity: i === index ? 1 : 0.8,
                  padding: "0.4rem 0.6rem",
                  borderRadius: 6,
                  background: i === index ? "rgba(0,0,0,0.35)" : "transparent",
                  width: "100%",
                }}
              >
                <div style={{ fontWeight: 600 }}>{it.artist}</div>
                <div style={{ fontSize: "0.95rem" }}>{it.name}</div>
              </div>
            ))
          )}
        </div>

        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <div className="overlay-title" style={{ fontSize: "2rem" }}>
              {current ? current.categoryTitle : ""}
            </div>
            <div
              className="overlay-points"
              style={{ fontSize: "1.25rem", marginTop: "0.25rem" }}
            >
              {current ? `${current.points} points` : ""}
            </div>
          </div>
        </div>

        <div
          style={{
            width: 160,
            padding: "2rem",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            aria-label="Next answer"
            title="Next answer"
            onClick={handleNext}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "none",
              color: "white",
              padding: "0.6rem 0.8rem",
              borderRadius: 8,
              cursor: items.length === 0 ? "not-allowed" : "pointer",
              opacity: items.length === 0 ? 0.5 : 1,
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnswersPage;
