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

type RevealItem = {
  key: string;
  categoryId: string;
  categoryTitle: string;
  points: number;
  answerId: string;
  artist: string;
  name: string;
  songPath: string;
  song: string;
  year: string;
  imagePath: string;
  image: string;
  bonus: string;
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
  const [visibleReveals, setVisibleReveals] = useState<boolean[]>([]);
  const specialTimerRef = useRef<number | null>(null);

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
          answerId: answer?.id ?? "",
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
      .filter(Boolean) as RevealItem[];
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

  const specialCategory = useMemo(
    () => data.categories.find((c: any) => c.id === "special"),
    [],
  );

  const specialPrevAnswers = useMemo(() => {
    const answers = (specialCategory?.answers as Answer[] | undefined) ?? [];
    return answers;
  }, [specialCategory?.answers]);

  const isSpecialFinal =
    current?.categoryId === "special" && current.answerId === "8";

  // Get timedReveals from the question data
  const timedReveals = useMemo(() => {
    if (!isSpecialFinal) return null;
    const specialQuestions =
      (specialCategory?.questions as QuestionMeta[] | undefined) ?? [];
    const question8 = specialQuestions.find((q) => q.id === "8");
    return question8?.timedReveals ?? null;
  }, [isSpecialFinal, specialCategory?.questions]);

  useEffect(() => {
    // Clear any existing timers
    if (specialTimerRef.current) {
      clearTimeout(specialTimerRef.current);
      specialTimerRef.current = null;
    }

    if (!isSpecialFinal) {
      setVisibleReveals([]);
      return;
    }

    setVisibleReveals(new Array(specialPrevAnswers.length).fill(false));

    if (timedReveals && timedReveals.length > 0) {
      // Schedule each reveal at the exact time
      const timeouts: number[] = [];
      timedReveals.forEach((reveal, i) => {
        if (i >= specialPrevAnswers.length) return; // Safety check
        const delay = reveal.time * 1000;
        const timeout = window.setTimeout(() => {
          setVisibleReveals((prev) => {
            const newArr = [...prev];
            newArr[i] = true;
            return newArr;
          });
        }, delay);
        timeouts.push(timeout);
      });

      // Store the timeouts array in the ref (though we only need to clear them)
      specialTimerRef.current = timeouts[0] || null; // Just store one for cleanup

      return () => {
        timeouts.forEach(clearTimeout);
      };
    } else {
      // Fallback: reveal one every 2 seconds
      let step = 0;
      const revealNext = () => {
        step += 1;
        setVisibleReveals((prev) => {
          const newArr = [...prev];
          newArr[step - 1] = true;
          return newArr;
        });
        if (step < specialPrevAnswers.length) {
          specialTimerRef.current = window.setTimeout(revealNext, 2000);
        }
      };
      specialTimerRef.current = window.setTimeout(revealNext, 2000);
    }

    return () => {
      if (specialTimerRef.current) {
        clearTimeout(specialTimerRef.current);
        specialTimerRef.current = null;
      }
    };
  }, [isSpecialFinal, specialPrevAnswers.length, timedReveals]);

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
      audio.onloadedmetadata = null;
      audio.ontimeupdate = null;
      audio.src = next;
      audio.load();

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
        audioRef.current.onloadedmetadata = null;
        audioRef.current.ontimeupdate = null;
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (specialTimerRef.current) {
        window.clearInterval(specialTimerRef.current);
        specialTimerRef.current = null;
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
          padding: isSpecialFinal ? "4rem 0 3rem" : "4rem 3rem 3rem",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            flex: 1,
            maxWidth: isSpecialFinal ? "100%" : "1200px",
            padding: "2rem",
            marginTop: "5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            alignItems: isSpecialFinal ? "center" : "flex-start",
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
                marginLeft: isSpecialFinal ? 0 : "3rem",
                display: "flex",
                flexDirection: "column",
                alignItems: isSpecialFinal ? "center" : "flex-start",
                gap: "0.75rem",
              }}
            >
              {isSpecialFinal ? (
                <SpecialFinalReveal
                  current={current}
                  specialPrevAnswers={specialPrevAnswers}
                  visibleReveals={visibleReveals}
                />
              ) : (
                <DefaultAnswerContent
                  current={current}
                  imageSrc={imageSrc}
                  setImageSrc={setImageSrc}
                  imageQueueRef={imageQueueRef}
                />
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

type DefaultAnswerContentProps = {
  current: RevealItem;
  imageSrc: string;
  setImageSrc: (src: string) => void;
  imageQueueRef: React.MutableRefObject<string[]>;
};

const DefaultAnswerContent: React.FC<DefaultAnswerContentProps> = ({
  current,
  imageSrc,
  setImageSrc,
  imageQueueRef,
}) => (
  <>
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
                fontSize: "1.89rem",
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
  </>
);

type SpecialFinalRevealProps = {
  current: RevealItem;
  specialPrevAnswers: Answer[];
  visibleReveals: boolean[];
};

const SpecialFinalReveal: React.FC<SpecialFinalRevealProps> = ({
  current,
  specialPrevAnswers,
  visibleReveals,
}) => {
  const isFinal = visibleReveals.length > 0 && visibleReveals.every((v) => v);
  const revealedOuter = useMemo(
    () => specialPrevAnswers.filter((_, i) => visibleReveals[i] ?? false),
    [specialPrevAnswers, visibleReveals],
  );

  const [outerSrcMap, setOuterSrcMap] = useState<Record<string, string>>({});
  const outerQueueRef = useRef<Record<string, string[]>>({});

  useEffect(() => {
    revealedOuter.forEach((answer) => {
      const key = answer.id;
      if (outerSrcMap[key]) return;
      const variants = buildAssetUrlVariants(
        `${answer.imagePath ?? ""}${answer.image ?? ""}.jpg`,
      );
      if (!variants.length) return;
      outerQueueRef.current[key] = variants.slice(1);
      setOuterSrcMap((prev) => ({ ...prev, [key]: variants[0] }));
    });
  }, [revealedOuter, outerSrcMap]);

  if (!revealedOuter.length) return null;

  const louBega = revealedOuter.find((a) => a.id === "8");
  const others = revealedOuter.filter((a) => a.id !== "8");

  const radius = 260;
  const outerSize = 150;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
        marginTop: "1rem",
        marginLeft: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          boxSizing: "border-box",
          gap: "2rem",
        }}
      >
        {isFinal ? (
          <div
            style={{
              textAlign: "center",
              color: "#fff",
              textShadow:
                "-2px -2px 0 rgba(0,0,0,0.6), 2px -2px 0 rgba(0,0,0,0.6), -2px 2px 0 rgba(0,0,0,0.6), 2px 2px 0 rgba(0,0,0,0.6), 0 6px 18px rgba(0,0,0,0.25)",
              marginRight: "1rem",
            }}
          >
            <div style={{ fontWeight: 800, fontSize: "3.08rem" }}>
              <span style={{ color: "red" }}>Lou Bega</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: "2.52rem", marginTop: 6 }}>
              {current.name}
            </div>
            {current.year ? (
              <div
                style={{ fontWeight: 600, fontSize: "1.82rem", opacity: 0.92 }}
              >
                {current.year}
              </div>
            ) : null}
          </div>
        ) : null}
        <div
          style={{
            position: "relative",
            width: `${radius * 2 + outerSize}px`,
            height: `${radius * 2 + outerSize}px`,
            maxWidth: "100%",
          }}
        >
          {others.map((answer) => {
            const originalIdx = specialPrevAnswers.findIndex(
              (a) => a.id === answer.id,
            );
            const angle =
              (2 * Math.PI * originalIdx) / (specialPrevAnswers.length - 1);
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            const left = radius + outerSize / 2 + x;
            const top = radius + outerSize / 2 + y;
            const src = outerSrcMap[answer.id] ?? "";
            return (
              <div
                key={answer.id}
                style={{
                  position: "absolute",
                  left,
                  top,
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: outerSize,
                    height: outerSize,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "5px solid #fff",
                    boxShadow: "0 10px 22px rgba(0,0,0,0.45)",
                    background: "rgba(0,0,0,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {src ? (
                    <img
                      src={src}
                      alt={answer.artist ?? "Special reveal"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={() => {
                        const queue = outerQueueRef.current[answer.id] ?? [];
                        const next = queue.shift();
                        if (next) {
                          setOuterSrcMap((prev) => ({
                            ...prev,
                            [answer.id]: next,
                          }));
                        }
                      }}
                    />
                  ) : null}
                </div>
                <div
                  style={{
                    marginTop: "0.5rem",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "2rem",
                    textShadow:
                      "-1px -1px 0 rgba(0,0,0,0.55), 1px -1px 0 rgba(0,0,0,0.55), -1px 1px 0 rgba(0,0,0,0.55), 1px 1px 0 rgba(0,0,0,0.55)",
                    whiteSpace: "nowrap",
                    textAlign: "center",
                  }}
                >
                  {answer.artist?.split(" ")[0] === "Eric"
                    ? "Erica"
                    : answer.artist?.split(" ")[0]}
                </div>
              </div>
            );
          })}
          {louBega && (
            <div
              key={louBega.id}
              style={{
                position: "absolute",
                left: radius + outerSize / 2,
                top: radius + outerSize / 2,
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: outerSize,
                  height: outerSize,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "5px solid #fff",
                  boxShadow: "0 10px 22px rgba(0,0,0,0.45)",
                  background: "rgba(0,0,0,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {outerSrcMap[louBega.id] ? (
                  <img
                    src={outerSrcMap[louBega.id]}
                    alt={louBega.artist ?? "Special reveal"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={() => {
                      const queue = outerQueueRef.current[louBega.id] ?? [];
                      const next = queue.shift();
                      if (next) {
                        setOuterSrcMap((prev) => ({
                          ...prev,
                          [louBega.id]: next,
                        }));
                      }
                    }}
                  />
                ) : null}
              </div>
              <div
                style={{
                  marginTop: "0.5rem",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "2rem",
                  textShadow:
                    "-1px -1px 0 rgba(0,0,0,0.55), 1px -1px 0 rgba(0,0,0,0.55), -1px 1px 0 rgba(0,0,0,0.55), 1px 1px 0 rgba(0,0,0,0.55)",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                {louBega.artist?.split(" ")[0]}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswersPage;
