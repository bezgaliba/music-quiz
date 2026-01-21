import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import data from "../data/questions.json";
import {
  buildAssetUrl,
  buildAssetUrlVariants,
  buildAudioUrlVariants,
} from "../utils/assets";
import { QuestionMeta, resolveQuestionByKey } from "../utils/questions";

import { incrementRound } from "../gameState";

type Answer = {
  id: string;
  artist?: string;
  name?: string;
  bonus?: string;
  songPath?: string;
  song?: string;
  imagePath?: string;
  image?: string;
  year?: string;
};

const USED_KEY = "usedQuestions";
const SEEN_KEY = "seenQuestions";

const AnswersPage: React.FC = () => {
  const navigate = useNavigate();
  const [usedKeys, setUsedKeys] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const imageQueueRef = useRef<string[]>([]);
  const [imageSrc, setImageSrc] = useState<string>("");

  useEffect(() => {
    try {
      const rawUsed = localStorage.getItem(USED_KEY) || "[]";
      const allUsed = JSON.parse(rawUsed) as string[];

      const rawSeen = localStorage.getItem(SEEN_KEY) || "[]";
      const seen = JSON.parse(rawSeen) as string[];

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
        const category = data.categories.find((c: any) => c.id === catId);
        if (!category) return null;
        const catQuestions = (category.questions as QuestionMeta[]) ?? [];
        const resolved = resolveQuestionByKey(catQuestions, pointsStr);
        if (!resolved) return null;

        const answer = (category.answers as Answer[] | undefined)?.find(
          (a) => a.id === resolved.question.id,
        );
        return {
          key: k,
          categoryId: catId,
          categoryTitle: category.title,
          points: resolved.points,
          artist: answer?.artist ?? "",
          name: answer?.name ?? "",
          songPath: answer?.songPath ?? "",
          song: answer?.song ?? "",
          year: answer?.year ?? "",
          imagePath: answer?.imagePath ?? "",
          image: answer?.image ?? "",
          bonus: answer?.bonus ?? "",
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
      year: string;
      imagePath: string;
      image: string;
      bonus: string;
    }>;
  }, [usedKeys]);

  const current =
    items.length > 0 && index >= 0 ? items[index % items.length] : null;

  useEffect(() => {
    if (current?.imagePath && current.image) {
      const variants = buildAssetUrlVariants(
        `${current.imagePath}${current.image}.jpg`,
      );
      setImageSrc(variants[0] ?? "");
      imageQueueRef.current = variants.slice(1);
    } else {
      setImageSrc("");
      imageQueueRef.current = [];
    }
  }, [current?.imagePath, current?.image]);

  useEffect(() => {
    if (!current) return;

    const { songPath, song } = current;
    if (!songPath || !song) return;
    const urls = buildAudioUrlVariants(songPath, song);
    if (!urls.length) return;

    audioQueueRef.current = [...urls];

    const playNext = () => {
      const next = audioQueueRef.current.shift();
      if (!next) return;

      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.loop = false;
      }

      const audio = audioRef.current;
      audio.onerror = () => playNext();
      audio.src = next;
      audio.currentTime = 0;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Autoplay blocked or failed, trying fallback:", error);
          playNext();
        });
      }
    };

    playNext();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
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
        backgroundImage: `url('${buildAssetUrl("resources/img/answersBackground.jpg")}')`,
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

      <div
        style={{
          position: "relative",
          display: "flex",
          flex: 1,
          gap: "2rem",
          padding: "4rem 3rem 3rem",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            flex: 1,
            maxWidth: "1200px",
            padding: "2rem",
            marginTop: "5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            alignItems: "flex-start",
          }}
        >
          {items.length === 0 ? (
            <div style={{ color: "white" }}>No new answers for this round.</div>
          ) : current ? (
            <div
              key={current.key}
              className="fly-in-content"
              style={{
                color: "#fff",
                padding: "1rem",
                borderRadius: 8,
                width: "100%",
                marginTop: "4rem",
                marginLeft: "3rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "3rem",
                  marginBottom: "0.5rem",
                  color: "red",
                  textShadow:
                    "-2px -2px 0 rgba(0,0,0,0.6), 2px -2px 0 rgba(0,0,0,0.6), -2px 2px 0 rgba(0,0,0,0.6), 2px 2px 0 rgba(0,0,0,0.6), 0 6px 18px rgba(0,0,0,0.25)",
                }}
              >
                {current.artist}
              </div>
              {current.name ? (
                <>
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
                </>
              ) : null}
              {current.imagePath && current.image && (
                <>
                  <div
                    style={{
                      position: "relative",
                      width: "fit-content",
                      maxWidth: "100%",
                      display: "inline-block",
                    }}
                  >
                    {current.bonus && (
                      <div
                        style={{
                          position: "absolute",
                          top: "1rem",
                          right: "1rem",
                          background: "rgba(184,111,148,0.75)",
                          color: "#fff",
                          padding: "1.1rem 1.3rem",
                          borderRadius: "12px",
                          fontWeight: 700,
                          fontSize: "1.35rem",
                          maxWidth: "55%",
                          textAlign: "left",
                          boxShadow: "0 8px 18px rgba(0,0,0,0.4)",
                          lineHeight: 1.5,
                          pointerEvents: "none",
                          textShadow:
                            "-1px -1px 0 rgba(0,0,0,0.55), 1px -1px 0 rgba(0,0,0,0.55), -1px 1px 0 rgba(0,0,0,0.55), 1px 1px 0 rgba(0,0,0,0.55)",
                        }}
                      >
                        {current.bonus}
                      </div>
                    )}
                    <img
                      src={imageSrc}
                      alt={current.artist}
                      style={{
                        width: "100%",
                        maxWidth: "100%",
                        height: "auto",
                        maxHeight: "620px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        boxShadow: "0 8px 18px rgba(0,0,0,0.5)",
                        display: "block",
                      }}
                      onError={() => {
                        const next = imageQueueRef.current.shift();
                        if (next) setImageSrc(next);
                      }}
                    />
                    {current.year && (
                      <div
                        aria-hidden
                        style={{
                          position: "absolute",
                          right: "1rem",
                          bottom: "1rem",
                          background: "rgba(0,0,0,0.35)",
                          color: "#fff",
                          padding: "0.25rem 0.5rem",
                          borderRadius: 6,
                          fontWeight: 600,
                          fontSize: "1.5rem",
                          textShadow:
                            "-2px -2px 0 rgba(0,0,0,0.6), 2px -2px 0 rgba(0,0,0,0.6), -2px 2px 0 rgba(0,0,0,0.6), 2px 2px 0 rgba(0,0,0,0.6), 0 6px 18px rgba(0,0,0,0.25)",
                          pointerEvents: "none",
                          zIndex: 2,
                        }}
                      >
                        {current.year}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : null}
        </div>

        <div
          style={{
            position: "absolute",
            top: "3rem",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            minWidth: "320px",
            padding: "0 1rem",
            pointerEvents: "none",
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

        <div
          style={{
            position: "absolute",
            right: "1.5rem",
            top: "50%",
            transform: "translateY(-50%)",
            width: 160,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            zIndex: 5,
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
