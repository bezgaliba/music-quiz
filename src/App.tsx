import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CardGrid from "components/CardGrid";
import QuestionPage from "./pages/QuestionPage";

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<CardGrid />} />
      <Route path="/question/:category/:id" element={<QuestionPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
