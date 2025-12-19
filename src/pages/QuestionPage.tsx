import React from "react";
import { useParams, Link } from "react-router-dom";
import data from "../data/questions.json";

const QuestionPage: React.FC = () => {
  const { category, id } = useParams();

  const cat = data.categories.find((c) => c.id === category);
  const question = cat?.questions.find((q) => q.id === id);

  if (!cat || !question) {
    return (
      <div style={{ padding: 24 }}>
        <Link to="/">← Back</Link>
        <h2>Question not found</h2>
        <p>We could not find that category or question.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Link to="/">← Back</Link>
      <h2>{cat.title}</h2>
      <p>{question.text}</p>
      <ul>
        {question.choices.map((c: string, i: number) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionPage;
