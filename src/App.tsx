import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CardGrid from "./components/CardGrid";
import QuestionPage from "./pages/QuestionPage";
import AnswersPage from "./pages/AnswersPage";

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<CardGrid />} />
      <Route path="/question/:category/:id" element={<QuestionPage />} />
      <Route path="/answers" element={<AnswersPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
