'use client';

import type { CategorizedItem, AnswerRecord, SessionSummary } from '../../lib/types';

interface SummaryPhaseProps {
  currentItem: CategorizedItem;
  answers: AnswerRecord[];
  sessionSummary: SessionSummary | null;
  isPending: boolean;
  onFinish: (confidence: 1 | 2 | 3 | 4 | 5) => void;
}

export function SummaryPhase({
  currentItem,
  answers,
  sessionSummary,
  isPending,
  onFinish,
}: SummaryPhaseProps) {
  return (
    <div className="space-y-6">
      {/* Answers recap */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Session Results for: {currentItem.item.itemId}
        </h3>

        {/* Individual question scores */}
        <div className="space-y-3 mb-6">
          {answers.map((a, i) => (
            <div
              key={i}
              className="flex items-start justify-between p-3 rounded-md bg-zinc-50 dark:bg-zinc-800"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
                  Q{i + 1}: {a.question}
                </p>
                <span className="text-xs text-zinc-400">{a.questionType}</span>
              </div>
              <span
                className={`ml-3 text-sm font-bold shrink-0 ${
                  a.score >= 4
                    ? 'text-green-600 dark:text-green-400'
                    : a.score === 3
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {a.score}/5
              </span>
            </div>
          ))}
        </div>

        {/* AI-generated summary */}
        {sessionSummary && (
          <div className="space-y-4 border-t border-zinc-200 dark:border-zinc-700 pt-4">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {sessionSummary.summary}
            </p>

            {sessionSummary.allMistakes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                  All Mistakes This Session
                </h4>
                <ul className="space-y-1 pl-4">
                  {sessionSummary.allMistakes.map((m, i) => (
                    <li
                      key={i}
                      className="text-sm text-zinc-600 dark:text-zinc-400 list-disc"
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {sessionSummary.focusAreas.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
                  🎯 Focus Areas for Next Review
                </h4>
                <ul className="space-y-1 pl-4">
                  {sessionSummary.focusAreas.map((f, i) => (
                    <li
                      key={i}
                      className="text-sm text-zinc-600 dark:text-zinc-400 list-disc"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confidence rating */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
        <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
          Rate your confidence to update the schedule:
          {sessionSummary && (
            <span className="ml-2 text-xs text-zinc-400">
              (AI suggests: {sessionSummary.recommendedConfidence}/5)
            </span>
          )}
        </h4>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as const).map((level) => (
            <button
              key={level}
              onClick={() => onFinish(level)}
              disabled={isPending}
              className={`flex-1 py-3 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
                level <= 2
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800'
                  : level === 3
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800'
                  : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800'
              } ${
                sessionSummary && level === sessionSummary.recommendedConfidence
                  ? 'ring-2 ring-blue-500'
                  : ''
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-1 text-xs text-zinc-400">
          <span>Forgot</span>
          <span>Perfect</span>
        </div>
      </div>
    </div>
  );
}
