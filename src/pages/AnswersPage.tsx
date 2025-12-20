import React from "react";
import { useNavigate } from "react-router-dom";

const AnswersPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div
      className="answers-page"
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/resources/img/answersBackground.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <button
        aria-label="Back to cards"
        className="answers-back-btn"
        onClick={() => navigate("/")}
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
    </div>
  );
};

export default AnswersPage;
