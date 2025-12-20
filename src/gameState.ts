let round = 1;

export const getRound = () => round;

export const incrementRound = () => {
  round += 1;
};

export const resetRound = () => {
  round = 1;
};

export const resetGame = () => {
  round = 1;
  try {
    localStorage.removeItem("usedQuestions");
    localStorage.removeItem("seenQuestions");
  } catch (e) {
    console.error("Failed to clear game state:", e);
  }
};
