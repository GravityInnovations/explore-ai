function randomValue(seed) {
  let state = (Number(seed) >>> 0) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

function shuffle(items, seed) {
  const result = [...items];
  const next = randomValue(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function selectQuizQuestions(quiz, objectiveIds, seed = 1) {
  if (!quiz.enabled) return [];
  const pool = shuffle(quiz.questions, seed);
  const selected = [];
  const covered = new Set();
  for (const objectiveId of objectiveIds) {
    const question = pool.find((item) => !selected.includes(item) && item.objectiveIds.includes(objectiveId));
    if (question) {
      selected.push(question);
      question.objectiveIds.forEach((id) => covered.add(id));
    }
  }
  for (const question of pool) {
    if (selected.length >= quiz.drawCount) break;
    if (!selected.includes(question)) selected.push(question);
  }
  const result = selected.slice(0, quiz.drawCount);
  const resultCoverage = new Set(result.flatMap((question) => question.objectiveIds));
  if (objectiveIds.some((objectiveId) => !resultCoverage.has(objectiveId))) return [];
  return result;
}

export function shuffleQuizAnswers(question, seed = 1) {
  return shuffle(question.answers, seed);
}
