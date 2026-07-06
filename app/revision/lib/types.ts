import type { RevisionData } from '@/src/types/Revision';
import type { RevisionCategory } from '@/src/revision/spaced';

export interface CategorizedItem {
  item: RevisionData;
  category: RevisionCategory;
}

export interface RevisionClientProps {
  categorizedItems: CategorizedItem[];
  dueItems: CategorizedItem[];
}

export type ViewTab = 'session' | 'schedule' | 'history';

/* ─── AI Review Types ─────────────────────────────────────── */

export interface ReviewQuestion {
  type: string;
  question: string;
  expectedAnswer: string;
  difficulty: string;
}

export interface EvaluationResult {
  score: number;
  mistakes: string[];
  correctAnswer: string;
  keyInsights: string[];
  feedback: string;
}

export interface AnswerRecord {
  question: string;
  questionType: string;
  response: string;
  score: number;
  mistakes: string[];
  keyInsights: string[];
  feedback: string;
  correctAnswer: string;
}

export interface SessionSummary {
  recommendedConfidence: number;
  allMistakes: string[];
  focusAreas: string[];
  summary: string;
}

export type SessionPhase =
  | 'idle'
  | 'generating'
  | 'answering'
  | 'evaluating'
  | 'feedback'
  | 'summary';
