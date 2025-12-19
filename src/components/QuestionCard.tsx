import React from "react";
import { Link } from "react-router-dom";

type QuestionCardProps = {
  title: string;
  categoryId: string;
  style?: React.CSSProperties;
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  title,
  categoryId,
  style,
}) => {
  return (
    <div className="card" style={style}>
      <div className="card-title">{title}</div>
      <div className="card-choices">
        <Link to={`/question/${categoryId}/1`} className="choice">
          1
        </Link>
        <Link to={`/question/${categoryId}/2`} className="choice">
          2
        </Link>
        <Link to={`/question/${categoryId}/3`} className="choice">
          3
        </Link>
      </div>
    </div>
  );
};

export default QuestionCard;
