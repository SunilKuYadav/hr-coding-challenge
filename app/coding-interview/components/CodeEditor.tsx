'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { EditorState, RangeSetBuilder, Extension } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, indentWithTab } from '@codemirror/commands';
import { indentOnInput, bracketMatching, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import type { CodeEditorProps } from '../lib/types';
import { formatCode } from '../services/formatService';

/* ─── Dark theme definition ──────────────────────────────── */

const darkTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#1e1e2e',
      color: '#cdd6f4',
    },
    '.cm-content': {
      caretColor: '#f5e0dc',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#f5e0dc',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: '#45475a',
    },
    '.cm-gutters': {
      backgroundColor: '#181825',
      color: '#6c7086',
      borderRight: '1px solid #313244',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#1e1e2e',
    },
    '.cm-activeLine': {
      backgroundColor: '#1e1e2e80',
    },
    '.cm-readOnlyRegion': {
      backgroundColor: '#18182580',
    },
  },
  { dark: true }
);

const lightTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#ffffff',
      color: '#1e1e2e',
    },
    '.cm-content': {
      caretColor: '#1e1e2e',
    },
    '.cm-gutters': {
      backgroundColor: '#f8f9fa',
      color: '#6c757d',
      borderRight: '1px solid #e9ecef',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#f1f3f5',
    },
    '.cm-activeLine': {
      backgroundColor: '#f8f9fa80',
    },
    '.cm-readOnlyRegion': {
      backgroundColor: '#f1f3f5',
    },
  },
  { dark: false }
);

/* ─── Read-only region decoration ────────────────────────── */

function createReadOnlyDecoration(readOnlyLength: number) {
  const readOnlyMark = Decoration.mark({ class: 'cm-readOnlyRegion' });

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.buildDecorations(update.view);
        }
      }

      buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        const docLength = view.state.doc.length;
        const end = Math.min(readOnlyLength, docLength);
        if (end > 0) {
          builder.add(0, end, readOnlyMark);
        }
        return builder.finish();
      }
    },
    { decorations: (v) => v.decorations }
  );
}

/* ─── CodeEditor Component ───────────────────────────────── */

export function CodeEditor({
  value,
  onChange,
  language,
  boilerplate,
  readOnly = false,
  starterCode,
  providedCode,
  helperFunctions,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [formatError, setFormatError] = useState<string | null>(null);

  // Determine if we're in rich mode (split view) or legacy mode
  const isRichMode = starterCode !== undefined && (providedCode !== undefined || helperFunctions !== undefined);

  // Compute read-only content and its length for rich mode
  const readOnlyContent = useMemo(() => {
    if (!isRichMode) return '';
    return [providedCode, helperFunctions].filter(Boolean).join('\n\n');
  }, [isRichMode, providedCode, helperFunctions]);

  const readOnlyLength = readOnlyContent.length;

  // The separator between read-only and editable regions
  const separator = readOnlyContent && starterCode ? '\n\n' : '';

  // Full document for rich mode: readOnlyContent + separator + editable content
  const fullDocumentRef = useRef('');

  // Keep onChange ref current
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Subscribe to dark mode changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Language extension
  const langExtension = useMemo(() => {
    return javascript({ typescript: language === 'typescript', jsx: true });
  }, [language]);

  // Initialize CodeMirror
  useEffect(() => {
    if (!editorRef.current) return;

    let initialDoc: string;
    let extensions: Extension[];

    if (isRichMode) {
      // Rich mode: combine read-only context + editable content
      initialDoc = readOnlyContent + separator + value;
      fullDocumentRef.current = initialDoc;

      // Change filter to prevent edits in read-only region
      const readOnlyBoundary = readOnlyContent.length + separator.length;
      const readOnlyFilter = EditorState.changeFilter.of((tr) => {
        let dominated = false;
        tr.changes.iterChanges((fromA, toA) => {
          if (fromA < readOnlyBoundary || toA < readOnlyBoundary) {
            dominated = true;
          }
        });
        return !dominated;
      });

      // Update listener that only emits the editable portion
      const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const doc = update.state.doc.toString();
          fullDocumentRef.current = doc;
          const editableContent = doc.slice(readOnlyBoundary);
          onChangeRef.current(editableContent);
        }
      });

      extensions = [
        lineNumbers(),
        highlightActiveLine(),
        drawSelection(),
        bracketMatching(),
        closeBrackets(),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        langExtension,
        keymap.of([...closeBracketsKeymap, ...defaultKeymap, indentWithTab]),
        isDark ? darkTheme : lightTheme,
        EditorView.lineWrapping,
        readOnlyFilter,
        createReadOnlyDecoration(readOnlyBoundary),
        updateListener,
      ];
    } else {
      // Legacy mode: simple editor
      initialDoc = value;

      const updateListener = EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const doc = update.state.doc.toString();
          onChangeRef.current(doc);
        }
      });

      extensions = [
        lineNumbers(),
        highlightActiveLine(),
        drawSelection(),
        bracketMatching(),
        closeBrackets(),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        langExtension,
        keymap.of([...closeBracketsKeymap, ...defaultKeymap, indentWithTab]),
        isDark ? darkTheme : lightTheme,
        EditorView.lineWrapping,
        EditorState.readOnly.of(readOnly),
        updateListener,
      ];
    }

    const state = EditorState.create({
      doc: initialDoc,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // We intentionally re-create the editor when theme or language changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark, langExtension, readOnly, isRichMode, readOnlyContent, separator]);

  // Sync external value changes into the editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    if (isRichMode) {
      const readOnlyBoundary = readOnlyContent.length + separator.length;
      const currentDoc = view.state.doc.toString();
      const currentEditable = currentDoc.slice(readOnlyBoundary);
      if (currentEditable !== value) {
        view.dispatch({
          changes: { from: readOnlyBoundary, to: currentDoc.length, insert: value },
        });
      }
    } else {
      const currentContent = view.state.doc.toString();
      if (currentContent !== value) {
        view.dispatch({
          changes: { from: 0, to: currentContent.length, insert: value },
        });
      }
    }
  }, [value, isRichMode, readOnlyContent, separator]);

  /* ─── Toolbar Actions ──────────────────────────────────── */

  const handleCopy = useCallback(async () => {
    const view = viewRef.current;
    if (!view) return;

    const text = view.state.doc.toString();
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      // Fallback for environments where clipboard API is unavailable
      setCopyStatus('idle');
    }
  }, []);

  const handleReset = useCallback(() => {
    if (isRichMode) {
      if (window.confirm('Reset editor to starter code? This cannot be undone.')) {
        // In rich mode, only reset the editable portion to starterCode
        onChange(starterCode ?? '');
      }
    } else {
      if (window.confirm('Reset editor to boilerplate code? This cannot be undone.')) {
        onChange(boilerplate);
      }
    }
  }, [isRichMode, starterCode, boilerplate, onChange]);

  const handleFormat = useCallback(() => {
    const view = viewRef.current;
    if (!view) return;

    if (isRichMode) {
      // Only format the editable region
      const readOnlyBoundary = readOnlyContent.length + separator.length;
      const doc = view.state.doc.toString();
      const editableCode = doc.slice(readOnlyBoundary);
      const lang = language === 'typescript' ? 'typescript' : 'javascript';
      const result = formatCode(editableCode, lang);

      if (result.error) {
        setFormatError(result.error);
        setTimeout(() => setFormatError(null), 4000);
      } else {
        setFormatError(null);
        onChange(result.formatted);
      }
    } else {
      const code = view.state.doc.toString();
      const lang = language === 'typescript' ? 'typescript' : 'javascript';
      const result = formatCode(code, lang);

      if (result.error) {
        setFormatError(result.error);
        setTimeout(() => setFormatError(null), 4000);
      } else {
        setFormatError(null);
        onChange(result.formatted);
      }
    }
  }, [isRichMode, readOnlyContent, separator, language, onChange]);

  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  /* ─── Render ───────────────────────────────────────────── */

  return (
    <div
      className={`flex flex-col border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-white dark:bg-zinc-900'
          : ''
      }`}
      style={!isFullscreen ? { minHeight: '300px' } : undefined}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase mr-2">
            {language}
          </span>
          {isRichMode && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              (read-only context above)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={readOnly}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded
              text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Copy code to clipboard"
          >
            {copyStatus === 'copied' ? (
              <>
                <CheckIcon />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <CopyIcon />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Reset button */}
          <button
            type="button"
            onClick={handleReset}
            disabled={readOnly}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded
              text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={isRichMode ? 'Reset to starter code' : 'Reset to boilerplate code'}
          >
            <ResetIcon />
            <span>Reset</span>
          </button>

          {/* Format button */}
          <button
            type="button"
            onClick={handleFormat}
            disabled={readOnly}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded
              text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700
              disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Format code"
          >
            <FormatIcon />
            <span>Format</span>
          </button>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={handleFullscreenToggle}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded
              text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700
              transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Format error message */}
      {formatError && (
        <div className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <p className="text-xs text-red-700 dark:text-red-400">{formatError}</p>
        </div>
      )}

      {/* Editor container */}
      <div
        ref={editorRef}
        className="flex-1 overflow-auto"
        style={!isFullscreen ? { minHeight: '260px' } : undefined}
      />

      {/* Fullscreen exit control (fixed at top-right in fullscreen mode) */}
      {isFullscreen && (
        <button
          type="button"
          onClick={handleFullscreenToggle}
          className="fixed top-4 right-4 z-[51] px-3 py-1.5 text-sm font-medium rounded-md
            bg-zinc-800 text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900
            dark:hover:bg-zinc-300 shadow-lg transition-colors"
          aria-label="Exit fullscreen"
        >
          ✕ Exit Fullscreen
        </button>
      )}
    </div>
  );
}

/* ─── Icon Components ────────────────────────────────────── */

function CopyIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function FormatIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 6h16M4 12h8m-8 6h16"
      />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
      />
    </svg>
  );
}

function ExitFullscreenIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 9V4H4m0 0l5 5M9 20v-5H4m0 0l5-5m11-5h-5V4m0 0l5 5m-5 11h5v-5m0 0l-5 5"
      />
    </svg>
  );
}
