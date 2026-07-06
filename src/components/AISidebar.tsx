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

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MarkdownRenderer } from './MarkdownRenderer';
import { saveAIContent } from './ai-actions';
import { useAIStatus } from '@/src/providers/AIProvider';
import { logInput, logOutput, logError } from '@/src/ai/logger';

export interface AISidebarProps {
  context: 'topic' | 'problem';
  itemId: string;
  itemTitle?: string;
  available?: boolean;
}

interface ActionConfig {
  id: string;
  label: string;
  action: string;
  streaming: boolean;
  filename: string;
  /** Whether this is a general question not tied to the current item */
  isGeneral?: boolean;
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

const TOPIC_PROMPT_HELPERS = [
  { label: 'Explain concept', prompt: 'Explain this concept in simple terms with examples' },
  { label: 'Key points', prompt: 'List the key points and takeaways for this topic' },
  { label: 'Common mistakes', prompt: 'What are common mistakes or misconceptions for this topic?' },
  { label: 'Interview questions', prompt: 'Generate interview questions related to this topic' },
];

const PROBLEM_PROMPT_HELPERS = [
  { label: 'Explain approach', prompt: 'Explain the approach to solve this problem step by step' },
  { label: 'Time complexity', prompt: 'Analyze the time and space complexity of the solution' },
  { label: 'Edge cases', prompt: 'What are the edge cases to consider for this problem?' },
  { label: 'Alternative solutions', prompt: 'What are alternative approaches to solve this problem?' },
];

/**
 * Heuristic to detect if a user's prompt is a general question (not specific
 * to the current problem/topic). General questions shouldn't be saved to the
 * item's folder.
 */
function detectGeneralQuestion(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  const generalPhrases = [
    'what is',
    'what are',
    'how does',
    'how do',
    'explain the difference',
    'compare',
    'define',
    'tell me about',
    'in general',
    'generally',
    'what\'s the difference between',
  ];
  const specificPhrases = [
    'this problem',
    'this topic',
    'this solution',
    'this code',
    'the approach',
    'my solution',
    'my notes',
    'this concept',
    'for this',
    'here',
    'above',
  ];

  const hasSpecificReference = specificPhrases.some((phrase) => lower.includes(phrase));
  if (hasSpecificReference) return false;

  const hasGeneralPhrase = generalPhrases.some((phrase) => lower.includes(phrase));
  // If it starts with a general phrase and doesn't reference the item, likely general
  if (hasGeneralPhrase) return true;

  return false;
}

export default function AISidebar({ context, itemId, itemTitle, available: availableProp }: AISidebarProps) {
  const { available: contextAvailable } = useAIStatus();
  const available = availableProp ?? contextAvailable;

  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [completed, setCompleted] = useState(false);
  const [activeAction, setActiveAction] = useState<ActionConfig | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showHelpers, setShowHelpers] = useState(false);

  const actions = context === 'topic' ? TOPIC_ACTIONS : PROBLEM_ACTIONS;
  const promptHelpers = context === 'topic' ? TOPIC_PROMPT_HELPERS : PROBLEM_PROMPT_HELPERS;

  const router = useRouter();

  // Resize state
  const [width, setWidth] = useState(320);
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(320);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const diff = startX.current - e.clientX;
      const newWidth = Math.min(Math.max(startWidth.current + diff, 240), 700);
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [width]);

  const handleAction = useCallback(async (actionConfig: ActionConfig) => {
    setLoading(true);
    setOutput('');
    setCompleted(false);
    setActiveAction(actionConfig);
    setSaveStatus('idle');

    try {
      const requestBody = { action: actionConfig.action, itemId, context };
      logInput(JSON.stringify(requestBody), actionConfig.action);

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        logError(JSON.stringify(requestBody), `HTTP ${response.status}`);
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
        logOutput(JSON.stringify(requestBody), accumulated);
      } else {
        // JSON response
        const data = await response.json();
        const formatted = JSON.stringify(data, null, 2);
        setOutput(formatted);
        logOutput(JSON.stringify(requestBody), formatted);
      }

      setCompleted(true);
    } catch {
      setOutput('Error: Connection failed. Please check your network.');
      setCompleted(true);
    } finally {
      setLoading(false);
    }
  }, [itemId, context]);

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

  const handleCustomPrompt = useCallback(async () => {
    if (!customPrompt.trim() || loading) return;

    const isGeneral = detectGeneralQuestion(customPrompt.trim());

    setLoading(true);
    setOutput('');
    setCompleted(false);
    setActiveAction({
      id: 'custom',
      label: 'Custom',
      action: 'custom',
      streaming: true,
      filename: 'ai-response.md',
      isGeneral,
    });
    setSaveStatus('idle');

    try {
      const requestBody = {
        action: 'custom',
        itemId,
        context,
        prompt: customPrompt.trim(),
        isGeneral,
      };
      logInput(customPrompt.trim(), 'custom');

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        logError(customPrompt.trim(), `HTTP ${response.status}`);
        setOutput('Error: Failed to generate content. Please try again.');
        setCompleted(true);
        setLoading(false);
        return;
      }

      if (response.body) {
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
        logOutput(customPrompt.trim(), accumulated);
      } else {
        const data = await response.json();
        const formatted = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        setOutput(formatted);
        logOutput(customPrompt.trim(), formatted);
      }

      setCompleted(true);
      setCustomPrompt('');
    } catch {
      setOutput('Error: Connection failed. Please check your network.');
      setCompleted(true);
    } finally {
      setLoading(false);
    }
  }, [customPrompt, loading, itemId, context]);

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

          {/* Custom prompt input */}
          <div className="space-y-2">
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

            <div className="flex gap-1.5">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCustomPrompt();
                  }
                }}
                placeholder="Ask anything..."
                disabled={!available || loading}
                className="flex-1 px-3 py-1.5 text-sm rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
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
                onClick={async () => {
                  // Save the content first, then navigate to edit it
                  if (activeAction) {
                    const result = await saveAIContent(itemId, context, output, activeAction.filename);
                    if (result.success && result.path) {
                      router.push(`/edit/${result.path}`);
                    }
                  }
                }}
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
      )}
    </aside>
  );
}

/**
 * Renders JSON output (quiz, flashcards, similar) in a readable format.
 * Falls back to formatted code block if parsing fails.
 */
function QuizJsonRenderer({ output }: { output: string }) {
  try {
    const parsed = JSON.parse(output);

    // Quiz questions format: { questions: [...] }
    if (parsed.questions && Array.isArray(parsed.questions)) {
      return (
        <div className="space-y-4">
          {parsed.questions.map((q: { question: string; options: string[]; correctIndex: number; explanation: string }, i: number) => (
            <div key={i} className="space-y-1.5">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {i + 1}. {q.question}
              </p>
              <ul className="space-y-0.5 pl-4">
                {q.options.map((opt: string, j: number) => (
                  <li
                    key={j}
                    className={`text-xs ${j === q.correctIndex ? 'text-green-700 dark:text-green-400 font-medium' : 'text-zinc-600 dark:text-zinc-400'}`}
                  >
                    {String.fromCharCode(65 + j)}. {opt}
                    {j === q.correctIndex && ' ✓'}
                  </li>
                ))}
              </ul>
              {q.explanation && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 italic pl-4">
                  {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Flashcards format: { cards: [...] }
    if (parsed.cards && Array.isArray(parsed.cards)) {
      return (
        <div className="space-y-3">
          {parsed.cards.map((card: { front: string; back: string }, i: number) => (
            <div key={i} className="rounded border border-zinc-200 dark:border-zinc-700 p-2.5">
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">Q</p>
              <p className="text-sm text-zinc-900 dark:text-zinc-100 mb-2">{card.front}</p>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mb-1">A</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{card.back}</p>
            </div>
          ))}
        </div>
      );
    }

    // Similar problems format: { suggestions: [...] }
    if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
      return (
        <div className="space-y-2">
          {parsed.suggestions.map((s: { title: string; url?: string; reason?: string }, i: number) => (
            <div key={i} className="text-sm">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">{s.title}</p>
              {s.reason && <p className="text-xs text-zinc-500 dark:text-zinc-400">{s.reason}</p>}
              {s.url && (
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  {s.url}
                </a>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Fallback: formatted JSON
    return (
      <pre className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words font-mono">
        {JSON.stringify(parsed, null, 2)}
      </pre>
    );
  } catch {
    // Not valid JSON, show as raw text
    return (
      <pre className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap break-words font-mono">
        {output}
      </pre>
    );
  }
}
