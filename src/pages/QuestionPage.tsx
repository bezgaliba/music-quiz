import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import data from "../data/questions.json";

const POINTS: Record<string, number> = {
  "1": 30,
  "2": 40,
  "3": 50,
};

const QuestionPage: React.FC = () => {
  const { category, id } = useParams<{ category: string; id: string }>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const cat = data.categories.find((c: any) => c.id === category);
  const numericToQid: Record<string, string> = {
    "30": "1",
    "40": "2",
    "50": "3",
  };
  const normalizedId = id && numericToQid[id] ? numericToQid[id] : (id ?? "1");
  const points = POINTS[normalizedId] ?? 0;
  const navigate = useNavigate();
  const imageForPoints = (p: number) => {
    if (p === 30) return "/resources/img/turntable30.jpeg";
    if (p === 40) return "/resources/img/turntable40.jpeg";
    if (p === 50) return "/resources/img/turntable50.jpeg";
    return "/resources/img/turntable.jpeg";
  };

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

  return (
    <div className="question-page">
      <div className="turntable-container">
        <img
          src={imageForPoints(points)}
          alt="Turntable"
          className="turntable-img"
        />
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
          marginTop: "1rem",
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
            const questionMeta = catData
              ? catData.questions.find((q: any) => q.id === normalizedId)
              : undefined;
            const fileUrl = questionMeta
              ? `${questionMeta.songPath.replace(/^public/, "")}${questionMeta.song}.mp3`
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

            if (
              audio.src !== window.location.origin + fileUrl &&
              audio.src !== fileUrl
            ) {
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
      </div>
    </div>
  );
};

export default QuestionPage;
