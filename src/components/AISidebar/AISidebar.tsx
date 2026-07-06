'use client';

/**
 * AI Sidebar component for generating AI content in Topic and Problem views.
 *
 * Displays contextual actions based on the current view context:
 * - Topic: Generate Summary, Generate Quiz, Generate Flashcards
 * - Problem: Interview Prep, Find Similar, Explain Solution
 *
 * Streams responses progressively and offers a save-to-file button on completion.
 * Disables all actions with a message when AI service is unreachable.
 *
 * Requirements: 13.1, 13.2, 13.3, 13.4
 */

import { MarkdownRenderer } from '../MarkdownRenderer';
import type { AISidebarProps } from './types';
import { QuizJsonRenderer } from './QuizJsonRenderer';
import { useAISidebar } from './useAISidebar';

export default function AISidebar({ context, itemId, itemTitle, available: availableProp }: AISidebarProps) {
  const {
    available,
    collapsed,
    loading,
    output,
    completed,
    activeAction,
    saveStatus,
    customPrompt,
    showHelpers,
    width,
    actions,
    promptHelpers,
    setCollapsed,
    setCustomPrompt,
    setShowHelpers,
    handleResizeStart,
    handleAction,
    handleSave,
    handleOpenInEditor,
    handleCustomPrompt,
  } = useAISidebar({ context, itemId, available: availableProp });

  return (
    <aside
      className="h-full border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 relative"
      style={{ width: collapsed ? 48 : width }}
    >
      {/* Resize handle */}
      {!collapsed && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-500/30 active:bg-blue-500/50 transition-colors z-10"
        />
      )}
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            AI Assistant
          </h2>
          {!collapsed && itemTitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5" title={itemTitle}>
              <span className="inline-flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${context === 'problem' ? 'bg-blue-500' : 'bg-green-500'}`} />
                {context === 'problem' ? 'Problem' : 'Topic'}: {itemTitle}
              </span>
            </p>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-xs shrink-0"
          aria-label={collapsed ? 'Expand AI sidebar' : 'Collapse AI sidebar'}
        >
          {collapsed ? '◀' : '▶'}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Unavailable message */}
            {!available && (
              <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  AI unavailable — AI service is not running
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2">
              {actions.map((actionConfig) => (
                <button
                  key={actionConfig.id}
                  onClick={() => handleAction(actionConfig)}
                  disabled={!available || loading}
                  className="w-full text-left px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionConfig.label}
                </button>
              ))}
            </div>

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Generating...</span>
              </div>
            )}

            {/* Output display */}
            {output && (
              <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3 overflow-y-auto">
                {activeAction && !activeAction.streaming ? (
                  <QuizJsonRenderer output={output} />
                ) : (
                  <div className="prose prose-sm prose-zinc dark:prose-invert max-w-none">
                    <MarkdownRenderer>{output}</MarkdownRenderer>
                  </div>
                )}
              </div>
            )}

            {/* Save button — only for item-specific responses */}
            {completed && output && activeAction && !activeAction.isGeneral && (
              <div className="space-y-2">
                <button
                  onClick={handleSave}
                  disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                  className="w-full px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saveStatus === 'idle' && `Save to ${context === 'topic' ? 'Topic' : 'Problem'}`}
                  {saveStatus === 'saving' && 'Saving...'}
                  {saveStatus === 'saved' && '✓ Saved'}
                  {saveStatus === 'error' && 'Save Failed — Retry'}
                </button>
                <button
                  onClick={handleOpenInEditor}
                  disabled={saveStatus === 'saving'}
                  className="w-full px-3 py-2 text-sm font-medium rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Open in Editor
                </button>
                {saveStatus === 'saved' && activeAction && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Saved as {activeAction.filename}
                  </p>
                )}
              </div>
            )}

            {/* General question notice */}
            {completed && output && activeAction?.isGeneral && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                General response — not linked to this {context}.
              </p>
            )}
          </div>

          {/* Custom prompt input — pinned to bottom */}
          <div className="shrink-0 border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Ask AI
              </label>
              <button
                type="button"
                onClick={() => setShowHelpers(!showHelpers)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {showHelpers ? 'Hide suggestions' : 'Suggestions'}
              </button>
            </div>

            {/* Helper prompt suggestions */}
            {showHelpers && (
              <div className="flex flex-wrap gap-1.5">
                {promptHelpers.map((helper) => (
                  <button
                    key={helper.label}
                    type="button"
                    onClick={() => { setCustomPrompt(helper.prompt); setShowHelpers(false); }}
                    disabled={!available || loading}
                    className="px-2 py-1 text-xs rounded-full border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {helper.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-1.5 items-end">
              <textarea
                value={customPrompt}
                onChange={(e) => {
                  setCustomPrompt(e.target.value);
                  e.target.style.height = 'auto';
                  const lineHeight = 20;
                  const maxHeight = lineHeight * 3 + 12;
                  e.target.style.height = `${Math.min(e.target.scrollHeight, maxHeight)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCustomPrompt();
                  }
                }}
                placeholder="Ask anything..."
                disabled={!available || loading}
                rows={1}
                className="flex-1 px-3 py-1.5 text-sm rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 resize-none overflow-y-auto"
                style={{ maxHeight: '4.5rem' }}
              />
              <button
                onClick={handleCustomPrompt}
                disabled={!available || loading || !customPrompt.trim()}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send prompt"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
