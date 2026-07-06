export { createOllamaClient } from './client';
export type { OllamaClient } from './client';

export { generateSummary } from './summarize';

export { generateQuiz } from './generateQuiz';
export type { QuizQuestion } from './generateQuiz';

export { generateFlashcards } from './generateFlashcards';

export { explainConcept, suggestSimilarProblems, generateInterviewPrep } from './explain';

export { getAIStatus, startHealthCheck, stopHealthCheck } from './status';
