'use client';

/**
 * AI Sidebar component for generating AI content in Topic and Problem views.
 *
 * Displays contextual actions based on the current view context:
 * - Topic: Generate Summary, Generate Quiz, Generate Flashcards
 * - Problem: Interview Prep, Find Similar, Explain Solution
 *
 * Streams responses progressively and offers a save-to-file button on completion.
 * Disables all actions with a message when Ollama is unreachable.
 *
 * Requirements: 13.1, 13.2, 13.3, 13.4
 */

import { useState, useCallback } from 'react';
import { saveAIContent } from './ai-actions';
import { useAIStatus } from '@/src/providers/AIProvider';

export interface AISidebarProps {
  context: 'topic' | 'problem';
  itemId: string;
  available?: boolean;
}

interface ActionConfig {
  id: string;
  label: string;
  action: string;
  streaming: boolean;
  filename: string;
}

const TOPIC_ACTIONS: ActionConfig[] = [
  { id: 'summary', label: 'Generate Summary', action: 'summary', streaming: true, filename: 'ai-summary.md' },
  { id: 'quiz', label: 'Generate Quiz', action: 'quiz', streaming: false, filename: 'ai-quiz.json' },
  { id: 'flashcards', label: 'Generate Flashcards', action: 'flashcards', streaming: false, filename: 'ai-flashcards.json' },
];

const PROBLEM_ACTIONS: ActionConfig[] = [
  { id: 'interview', label: 'Interview Prep', action: 'interview', streaming: true, filename: 'ai-interview-prep.md' },
  { id: 'similar', label: 'Find Similar', action: 'similar', streaming: false, filename: 'ai-similar.json' },
  { id: 'explain', label: 'Explain Solution', action: 'explain', streaming: true, filename: 'ai-explanation.md' },
];

export default function AISidebar({ context, itemId, available: availableProp }: AISidebarProps) {
  const { available: contextAvailable } = useAIStatus();
  const available = availableProp ?? contextAvailable;

  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [completed, setCompleted] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionConfig | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const actions = context === 'topic' ? TOPIC_ACTIONS : PROBLEM_ACTIONS;

  const handleAction = useCallback(async (actionConfig: ActionConfig) => {
    setLoading(true);
    setOutput('');
    setCompleted(false);
    setActiveAction(actionConfig);
    setSaveStatus('idle');

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionConfig.action, itemId }),
      });

      if (!response.ok) {
        setOutput('Error: Failed to generate content. Please try again.');
        setCompleted(true);
        setLoading(false);
        return;
      }

      if (actionConfig.streaming && response.body) {
        // Stream the response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setOutput(accumulated);
        }
      } else {
        // JSON response
        const data = await response.json();
        const formatted = JSON.stringify(data, null, 2);
        setOutput(formatted);
      }

      setCompleted(true);
    } catch {
      setOutput('Error: Connection failed. Please check your network.');
      setCompleted(true);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  const handleSave = useCallback(async () => {
    if (!activeAction || !output) return;

    setSaveStatus('saving');
    const result = await saveAIContent(itemId, context, output, activeAction.filename);

    if (result.success) {
      setSaveStatus('saved');
    } else {
      setSaveStatus('error');
    }
  }, [activeAction, output, itemId, context]);

  return (
    <aside className="border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 w-80 flex flex-col shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          AI Assistant
        </h2>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-xs"
          aria-label={collapsed ? 'Expand AI sidebar' : 'Collapse AI sidebar'}
        >
          {collapsed ? '◀' : '▶'}
        </button>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Unavailable message */}
          {!available && (
            <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
              <p className="text-xs text-amber-700 dark:text-amber-400">
                AI unavailable — Ollama is not running
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
            <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3 max-h-96 overflow-y-auto">
              <pre className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words font-mono">
                {output}
              </pre>
            </div>
          )}

          {/* Save button */}
          {completed && output && (
            <div className="space-y-2">
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                className="w-full px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saveStatus === 'idle' && 'Save to File'}
                {saveStatus === 'saving' && 'Saving...'}
                {saveStatus === 'saved' && '✓ Saved'}
                {saveStatus === 'error' && 'Save Failed — Retry'}
              </button>
              {saveStatus === 'saved' && activeAction && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  Saved as {activeAction.filename}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
