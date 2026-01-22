import { useMemo } from "react";

export type QuestionMeta = {
  id: string;
  header?: string;
  songPath?: string;
  song?: string;
  bonus?: string;
  coverImagePath?: string;
  coverImage?: string;
  points?: number;
  timedReveals?: Array<{ time: number; text: string; duration?: number }>;
};

const DEFAULT_POINTS = ["30", "40", "50"] as const;

export const pointsForQuestion = (question: QuestionMeta, index: number) => {
  if (question.points !== undefined) return question.points;
  if (DEFAULT_POINTS[index]) return parseInt(DEFAULT_POINTS[index], 10);
  const parsedId = parseInt(question.id ?? "", 10);
  return Number.isFinite(parsedId) ? parsedId : 0;
};

export const deriveQuestionKey = (question: QuestionMeta, index: number) => {
  const hasExplicitPoints = question.points !== undefined;
  if (hasExplicitPoints) return question.id ?? `${index + 1}`;
  if (DEFAULT_POINTS[index]) return DEFAULT_POINTS[index];
  return question.id ?? `${index + 1}`;
};

export const listQuestionKeys = (questions: QuestionMeta[]) =>
  questions.map((q, idx) => deriveQuestionKey(q, idx));

export const resolveQuestionByKey = (
  questions: QuestionMeta[],
  key?: string,
) => {
  if (!questions.length) return null;
  const normalizedKey = key ?? deriveQuestionKey(questions[0], 0);
  const matchIndex = questions.findIndex((q, idx) => {
    const derived = deriveQuestionKey(q, idx);
    return derived === normalizedKey || q.id === normalizedKey;
  });

  const index = matchIndex >= 0 ? matchIndex : 0;
  const question = questions[index];
  const resolvedKey = deriveQuestionKey(question, index);
  const points = pointsForQuestion(question, index);

  return { question, index, key: resolvedKey, points } as const;
};

export const useQuestionResolution = (
  questions: QuestionMeta[],
  key?: string,
) => useMemo(() => resolveQuestionByKey(questions, key), [questions, key]);
