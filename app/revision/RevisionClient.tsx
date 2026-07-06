'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import type { RevisionData } from '@/src/types/Revision';
import type { RevisionCategory } from '@/src/revision/spaced';
import { rateRevision } from './actions';

interface CategorizedItem {
  item: RevisionData;
  category: RevisionCategory;
}

interface RevisionClientProps {
  categorizedItems: CategorizedItem[];
  dueItems: CategorizedItem[];
}

type ViewTab = 'session' | 'schedule' | 'history';

export default function RevisionClient({
  categorizedItems,
  dueItems,
}: RevisionClientProps) {
  const [activeTab, setActiveTab] = useState<ViewTab>('session');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Revision
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Review, schedule, and track your learning progress
        </p>
      </header>

      {/* Tab Navigation */}
      <nav className="flex gap-1 mb-8 border-b border-zinc-200 dark:border-zinc-800">
        <TabButton
          active={activeTab === 'session'}
          onClick={() => setActiveTab('session')}
        >
          Review Session
        </TabButton>
        <TabButton
          active={activeTab === 'schedule'}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule
        </TabButton>
        <TabButton
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        >
          History
        </TabButton>
      </nav>

      {/* Tab Content */}
      {activeTab === 'session' && <ReviewSession dueItems={dueItems} />}
      {activeTab === 'schedule' && (
        <ScheduleView categorizedItems={categorizedItems} />
      )}
      {activeTab === 'history' && (
        <HistoryView categorizedItems={categorizedItems} />
      )}
    </div>
  );
}

/* ─── Tab Button ──────────────────────────────────────────── */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
          : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
      }`}
    >
      {children}
    </button>
  );
}

/* ─── Review Session ──────────────────────────────────────── */

function ReviewSession({ dueItems }: { dueItems: CategorizedItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [completedCount, setCompletedCount] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  if (dueItems.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center">
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          No items due for review right now.
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
          Check back later or browse the schedule tab to see upcoming reviews.
        </p>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center">
        <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Session Complete!
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          You reviewed {completedCount} item{completedCount !== 1 ? 's' : ''}.
        </p>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setCompletedCount(0);
            setSessionComplete(false);
            setRevealed(false);
          }}
          className="mt-4 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Start New Session
        </button>
      </div>
    );
  }

  const currentItem = dueItems[currentIndex];

  const handleRate = (confidence: 1 | 2 | 3 | 4 | 5) => {
    startTransition(async () => {
      await rateRevision(
        currentItem.item.itemId,
        currentItem.item.itemType,
        confidence
      );

      const nextIndex = currentIndex + 1;
      setCompletedCount((c) => c + 1);
      setRevealed(false);

      if (nextIndex >= dueItems.length) {
        setSessionComplete(true);
      } else {
        setCurrentIndex(nextIndex);
      }
    });
  };

  return (
    <div>
      {/* Progress indicator */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {completedCount + 1}/{dueItems.length} reviewed
        </p>
        <div className="flex-1 mx-4 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all"
            style={{
              width: `${((completedCount) / dueItems.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Review Card */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8">
        <div className="mb-4">
          <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {currentItem.item.itemType}
          </span>
          <span className="ml-2 inline-block text-xs font-medium px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
            {currentItem.category}
          </span>
        </div>

        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          {currentItem.item.itemId}
        </h2>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Current confidence: {currentItem.item.confidence}/5 · Last reviewed:{' '}
          {currentItem.item.lastReviewed
            ? currentItem.item.lastReviewed.split('T')[0]
            : 'Never'}
        </p>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-3 px-4 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Reveal Details
          </button>
        ) : (
          <div>
            <div className="mb-6 p-4 rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Review this item and rate your confidence level below.
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Next review was scheduled for: {currentItem.item.nextReview.split('T')[0]}
              </p>
              {currentItem.item.history.length > 0 && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Previous reviews: {currentItem.item.history.length}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                Rate your confidence:
              </p>
              <div className="flex gap-2">
                {([1, 2, 3, 4, 5] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => handleRate(level)}
                    disabled={isPending}
                    className={`flex-1 py-3 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
                      level <= 2
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800'
                        : level === 3
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800'
                        : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border border-green-200 dark:border-green-800'
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
        )}
      </div>
    </div>
  );
}

/* ─── Schedule View ───────────────────────────────────────── */

function ScheduleView({
  categorizedItems,
}: {
  categorizedItems: CategorizedItem[];
}) {
  const overdue = categorizedItems.filter((c) => c.category === 'overdue');
  const dueToday = categorizedItems.filter((c) => c.category === 'due-today');
  const upcoming = categorizedItems.filter((c) => c.category === 'upcoming');

  return (
    <div className="space-y-8">
      <ScheduleGroup
        title="Overdue"
        items={overdue}
        emptyMessage="No overdue items"
        badgeColor="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
      />
      <ScheduleGroup
        title="Due Today"
        items={dueToday}
        emptyMessage="Nothing due today"
        badgeColor="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
      />
      <ScheduleGroup
        title="Upcoming"
        items={upcoming}
        emptyMessage="No upcoming reviews"
        badgeColor="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
      />
    </div>
  );
}

function ScheduleGroup({
  title,
  items,
  emptyMessage,
  badgeColor,
}: {
  title: string;
  items: CategorizedItem[];
  emptyMessage: string;
  badgeColor: string;
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded ${badgeColor}`}
        >
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {emptyMessage}
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((ci) => {
            const href =
              ci.item.itemType === 'topic'
                ? `/topics/${ci.item.itemId}`
                : `/problems/${ci.item.itemId}`;

            return (
              <li
                key={`${ci.item.itemType}-${ci.item.itemId}`}
                className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex items-center justify-between"
              >
                <div>
                  <Link
                    href={href}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {ci.item.itemId}
                  </Link>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {ci.item.itemType} · confidence {ci.item.confidence}/5
                  </p>
                </div>
                <span className="text-xs text-zinc-400">
                  {ci.item.nextReview.split('T')[0]}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/* ─── History View ────────────────────────────────────────── */

function HistoryView({
  categorizedItems,
}: {
  categorizedItems: CategorizedItem[];
}) {
  // Show items that have revision history
  const itemsWithHistory = categorizedItems.filter(
    (ci) => ci.item.history.length > 0
  );

  if (itemsWithHistory.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-10 text-center">
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          No revision history yet.
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
          Complete some review sessions to see your history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {itemsWithHistory.map((ci) => (
        <div
          key={`${ci.item.itemType}-${ci.item.itemId}`}
          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {ci.item.itemId}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {ci.item.itemType} · Current confidence: {ci.item.confidence}/5
              </p>
            </div>
            <span className="text-xs text-zinc-400">
              Next: {ci.item.nextReview.split('T')[0]}
            </span>
          </div>

          {/* Confidence trend as a simple visual */}
          <div className="mb-3">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
              Confidence Trend
            </p>
            <div className="flex items-end gap-1 h-10">
              {ci.item.history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex-1 rounded-t bg-blue-500 dark:bg-blue-400 transition-all"
                  style={{ height: `${(entry.confidence / 5) * 100}%` }}
                  title={`${entry.date.split('T')[0]}: ${entry.confidence}/5`}
                />
              ))}
            </div>
          </div>

          {/* History entries */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
              Past Reviews ({ci.item.history.length})
            </p>
            <ul className="space-y-1">
              {ci.item.history
                .slice()
                .reverse()
                .map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {entry.date.split('T')[0]}
                    </span>
                    <span
                      className={`font-medium ${
                        entry.confidence >= 4
                          ? 'text-green-600 dark:text-green-400'
                          : entry.confidence === 3
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {entry.confidence}/5
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
