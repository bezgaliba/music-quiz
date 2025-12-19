import React from "react";
import { useParams, Link } from "react-router-dom";
import data from "../data/questions.json";

const QuestionPage: React.FC = () => {
  const { category, id } = useParams<{ category: string; id: string }>();

  const cat = data.categories.find((c: any) => c.id === category);
  const question = cat?.questions?.find((q: any) => q.id === (id as string));

  return (
    <div className="question-page">
      <h1>{cat ? `${cat.title} — Question ${id}` : "Question"}</h1>
      <p>{question ? question.text : "No question found."}</p>
      <p>
        <Link to="/">Back</Link>
      </p>
    </div>
  );
};

export default QuestionPage;
