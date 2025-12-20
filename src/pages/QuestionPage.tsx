import React, { useRef, useState } from "react";
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
          onClick={() => navigate(-1)}
          role="button"
          aria-label="Go back"
          style={{ pointerEvents: "auto", cursor: "pointer" }}
        >
          <div className="overlay-title">{cat ? cat.title : ""}</div>
          <div className="overlay-points">{points} points</div>
        </div>
      </div>
      {/* Centered play/pause button under the image */}
      <div
        className="audio-control"
        style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}
      >
        <button
          aria-label={isPlaying ? "Pause" : "Play"}
          className={`icon-play-btn ${isPlaying ? "playing" : ""}`}
          onClick={async () => {
            // compute song url
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
            if (!audioRef.current) audioRef.current = new Audio(fileUrl);
            const audio = audioRef.current;
            if (audio.paused) {
              await audio.play();
              setIsPlaying(true);
            } else {
              audio.pause();
              setIsPlaying(false);
            }
            audio.onended = () => setIsPlaying(false);
          }}
        >
          {isPlaying ? (
            // Pause icon
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
            // Play icon
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
      </div>
    </div>
  );
};

export default QuestionPage;
