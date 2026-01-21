import React, { useRef, useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import data from "../data/questions.json";
import {
  buildAssetUrl,
  buildAssetUrlVariants,
  buildAudioUrl,
} from "../utils/assets";

type Question = {
  id: string;
  header?: string;
  songPath?: string;
  song?: string;
  bonus?: string;
  coverImagePath?: string;
  coverImage?: string;
};

const POINTS: Record<string, number> = {
  "1": 30,
  "2": 40,
  "3": 50,
};

const QuestionPage: React.FC = () => {
  const { category, id } = useParams<{ category: string; id: string }>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCover, setShowCover] = useState(false);
  const [coverSrc, setCoverSrc] = useState("");
  const coverQueueRef = useRef<string[]>([]);

  const cat = data.categories.find((c: any) => c.id === category);
  const numericToQid: Record<string, string> = {
    "30": "1",
    "40": "2",
    "50": "3",
  };
  const normalizedId = id && numericToQid[id] ? numericToQid[id] : (id ?? "1");
  const points = POINTS[normalizedId] ?? 0;
  const questionMeta = cat
    ? (cat.questions as Question[] | undefined)?.find(
        (q) => q.id === normalizedId,
      )
    : undefined;
  const coverVariants = useMemo(() => {
    if (!questionMeta?.coverImagePath || !questionMeta?.coverImage) return [];
    return buildAssetUrlVariants(
      `${questionMeta.coverImagePath}${questionMeta.coverImage}.jpg`,
    );
  }, [questionMeta?.coverImagePath, questionMeta?.coverImage]);
  const navigate = useNavigate();
  const defaultBackground = buildAssetUrl("resources/img/background.jpeg");
  const imageSrc = cat?.imagePath
    ? buildAssetUrl(cat.imagePath)
    : defaultBackground;

  useEffect(() => {
    return () => {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      } catch (e) {
        console.error("Error during cleanup:", e);
      }
    };
  }, []);

  useEffect(() => {
    setShowCover(false);
    setCoverSrc("");
    coverQueueRef.current = coverVariants.slice(1);
  }, [category, normalizedId, coverVariants]);

  const revealCover = () => {
    if (!coverVariants.length) return;
    setShowCover(true);
    setCoverSrc(coverVariants[0]);
    coverQueueRef.current = coverVariants.slice(1);
  };

  return (
    <div className="question-page">
      <div className={`turntable-container ${showCover ? "compact" : ""}`}>
        <img
          src={imageSrc}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = defaultBackground;
          }}
          alt={cat?.title ?? "Category background"}
          className="turntable-img"
        />
        {questionMeta?.header && (
          <div
            style={{
              position: "absolute",
              top: "8%",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.7)",
              color: "#fff",
              padding: "0.75rem 1.5rem",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "1.4rem",
              textAlign: "center",
              pointerEvents: "none",
              maxWidth: "80%",
              boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
            }}
          >
            {questionMeta.header}
          </div>
        )}
        {questionMeta?.bonus && (
          <div
            style={{
              position: "absolute",
              bottom: "8%",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.7)",
              color: "#b86f94",
              padding: "1.1rem 1.9rem",
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "clamp(28px, 6vw, 48px)",
              textAlign: "center",
              pointerEvents: "none",
              maxWidth: "90%",
              boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
              lineHeight: 1.2,
              textShadow:
                "-0.6px -0.6px 0 rgba(0,0,0,0.9), 0.6px -0.6px 0 rgba(0,0,0,0.9), -0.6px 0.6px 0 rgba(0,0,0,0.9), 0.6px 0.6px 0 rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.35)",
            }}
          >
            {questionMeta.bonus}
          </div>
        )}
        <div
          className="turntable-overlay"
          onClick={() => {
            if (audioRef.current) {
              try {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              } catch (e) {
                console.error("Error stopping audio on navigation:", e);
              }
            }
            navigate(-1);
          }}
          role="button"
          aria-label="Go back"
          style={{ pointerEvents: "auto", cursor: "pointer" }}
        >
          <div className="overlay-title">{cat ? cat.title : ""}</div>
          <div className="overlay-points">{points} points</div>
        </div>
      </div>
      <div
        className="audio-control"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "0.25rem",
          gap: "1rem",
        }}
      >
        <button
          aria-label={isPlaying ? "Pause" : "Play"}
          className={`icon-play-btn ${isPlaying ? "playing" : ""}`}
          onClick={async () => {
            const numericToQid: Record<string, string> = {
              "30": "1",
              "40": "2",
              "50": "3",
            };
            const normalizedId =
              id && numericToQid[id] ? numericToQid[id] : (id ?? "1");
            const catData = data.categories.find((c: any) => c.id === category);
            const questionMetaPlay = catData
              ? catData.questions.find((q: any) => q.id === normalizedId)
              : undefined;
            const fileUrl = questionMetaPlay
              ? buildAudioUrl(
                  questionMetaPlay.songPath ?? "",
                  questionMetaPlay.song ?? "",
                )
              : null;
            if (!fileUrl) return;

            if (!audioRef.current) audioRef.current = new Audio();
            const audio = audioRef.current;

            audio.onerror = () => {
              setIsPlaying(false);
              try {
                audio.pause();
                audio.removeAttribute("src");
                audio.load();
              } catch (e) {
                console.error("Audio error handling failed:", e);
              }
            };

            audio.onended = () => setIsPlaying(false);

            if (audio.src !== fileUrl) {
              audio.src = fileUrl;
              try {
                audio.load();
              } catch (e) {
                console.error("Audio load error:", e);
              }
            }

            if (audio.paused) {
              try {
                await audio.play();
                setIsPlaying(true);
              } catch {
                setIsPlaying(false);
              }
            } else {
              audio.pause();
              setIsPlaying(false);
            }
          }}
        >
          {isPlaying ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="6" y="5" width="4" height="14" fill="currentColor" />
              <rect x="14" y="5" width="4" height="14" fill="currentColor" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
            </svg>
          )}
        </button>
        <button
          aria-label="Reset"
          className="reset-btn"
          onClick={() => {
            if (!audioRef.current) return;
            const audio = audioRef.current;
            audio.pause();
            audio.currentTime = 0;
            setIsPlaying(false);
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6 0 3.31-2.69 6-6 6s-6-2.69-6-6H4a8 8 0 1 0 8-8z" />
          </svg>
        </button>
        {coverVariants.length > 0 && (
          <button
            aria-label={showCover ? "Hide" : "Reveal"}
            className="reveal-btn"
            onClick={() => {
              if (showCover) {
                setShowCover(false);
                setCoverSrc("");
                return;
              }
              revealCover();
            }}
          >
            {showCover ? "Hide" : "Reveal"}
          </button>
        )}
      </div>
      {showCover && coverSrc && (
        <div className="album-cover">
          <img
            src={coverSrc}
            alt={questionMeta?.header ?? `${cat?.title ?? "Album"} cover`}
            onError={() => {
              const next = coverQueueRef.current.shift();
              if (next) {
                setCoverSrc(next);
                return;
              }
              setShowCover(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default QuestionPage;
