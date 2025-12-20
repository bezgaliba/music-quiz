import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import data from "../data/questions.json";

import { incrementRound } from "../gameState";

const USED_KEY = "usedQuestions";
const SEEN_KEY = "seenQuestions";

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
      const rawUsed = localStorage.getItem(USED_KEY) || "[]";
      const allUsed = JSON.parse(rawUsed) as string[];

      const rawSeen = localStorage.getItem(SEEN_KEY) || "[]";
      const seen = JSON.parse(rawSeen) as string[];

      // Only show questions that are in 'used' but NOT in 'seen'
      const newItems = allUsed.filter((k) => !seen.includes(k));
      setUsedKeys(newItems);
    } catch {
      setUsedKeys([]);
    }
    setIndex(0);
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
          songPath: answer?.songPath ?? "",
          song: answer?.song ?? "",
          imagePath: answer?.imagePath ?? "",
          image: answer?.image ?? "",
        };
      })
      .filter(Boolean) as Array<{
      key: string;
      categoryId: string;
      categoryTitle: string;
      points: number;
      artist: string;
      name: string;
      songPath: string;
      song: string;
      imagePath: string;
      image: string;
    }>;
  }, [usedKeys]);

  const current =
    items.length > 0 && index >= 0 ? items[index % items.length] : null;

  useEffect(() => {
    if (!current) return;

    const { songPath, song } = current;
    if (!songPath || !song) return;

    // Remove 'public/' prefix if present and ensure leading slash
    const cleanPath = songPath.replace(/^public\//, "");
    const url = `/${cleanPath}${song}.mp3`.replace(/\/\//g, "/");

    const audio = new Audio(url);
    audio.loop = false;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Audio playback failed:", error);
      });
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [current]);

  const handleNext = () => {
    if (items.length === 0) return;
    setIndex((i) => (i + 1) % items.length);
  };

  const handleBack = () => {
    try {
      const rawUsed = localStorage.getItem(USED_KEY) || "[]";
      localStorage.setItem(SEEN_KEY, rawUsed);

      incrementRound();
    } catch (e) {
      console.error("Error saving seen questions:", e);
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
            width: "600px",
            padding: "2rem",
            marginTop: "3rem",
            marginLeft: "15rem",
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
          ) : current ? (
            <div
              key={current.key}
              className="fly-in-content"
              style={{
                color: "#fff",
                padding: "1rem",
                borderRadius: 8,
                background: "rgba(0,0,0,0.5)",
                width: "100%",
                marginTop: "10rem", // Push it down a bit so it doesn't overlap with back button
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "3rem",
                  marginBottom: "0.5rem",
                  textShadow:
                    "-2px -2px 0 rgba(0,0,0,0.6), 2px -2px 0 rgba(0,0,0,0.6), -2px 2px 0 rgba(0,0,0,0.6), 2px 2px 0 rgba(0,0,0,0.6), 0 6px 18px rgba(0,0,0,0.25)",
                }}
              >
                {current.artist}
              </div>
              <div
                style={{
                  fontSize: "2.2rem",
                  fontWeight: 600,
                  textShadow:
                    "-2px -2px 0 rgba(0,0,0,0.6), 2px -2px 0 rgba(0,0,0,0.6), -2px 2px 0 rgba(0,0,0,0.6), 2px 2px 0 rgba(0,0,0,0.6), 0 6px 18px rgba(0,0,0,0.25)",
                }}
              >
                {current.name}
              </div>
              <hr
                style={{
                  width: "100%",
                  border: "none",
                  borderTop: "8px solid #500000",
                  margin: "1rem 0",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                }}
              />
              {current.imagePath && current.image && (
                <img
                  src={`/${current.imagePath.replace(/^public\//, "")}${
                    current.image
                  }.jpg`.replace(/\/\//g, "/")}
                  alt={current.artist}
                  style={{
                    width: "300px",
                    height: "300px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
                  }}
                />
              )}
            </div>
          ) : null}
        </div>

        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              textAlign: "center",
              marginTop: "2rem",
              marginRight: "30rem",
              minWidth: "500px",
            }}
          >
            <div
              className="overlay-title"
              style={{
                fontSize: "3rem",
                fontWeight: 600,
                color: "#fff",
                whiteSpace: "nowrap",
                textShadow:
                  "-2px -2px 0 rgba(0,0,0,0.6), 2px -2px 0 rgba(0,0,0,0.6), -2px 2px 0 rgba(0,0,0,0.6), 2px 2px 0 rgba(0,0,0,0.6), 0 6px 18px rgba(0,0,0,0.25)",
              }}
            >
              {current ? current.categoryTitle : ""}
            </div>
            <div
              className="overlay-points"
              style={{
                fontSize: "2rem",
                marginTop: "0.5rem",
                fontWeight: 600,
                color: "#fff",
                whiteSpace: "nowrap",
                textShadow:
                  "-2px -2px 0 rgba(0,0,0,0.6), 2px -2px 0 rgba(0,0,0,0.6), -2px 2px 0 rgba(0,0,0,0.6), 2px 2px 0 rgba(0,0,0,0.6), 0 6px 18px rgba(0,0,0,0.25)",
              }}
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
          {index < items.length - 1 && (
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
                cursor: "pointer",
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswersPage;
