import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CardGrid from "./components/CardGrid";
import QuestionPage from "./pages/QuestionPage";
import AnswersPage from "./pages/AnswersPage";
import { resetGame } from "./gameState";

const App: React.FC = () => {
  useEffect(() => {
    // Reset game state (localStorage + round) on app load/refresh
    resetGame();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CardGrid />} />
        <Route path="/question/:category/:id" element={<QuestionPage />} />
        <Route path="/answers" element={<AnswersPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
