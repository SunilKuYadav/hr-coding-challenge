'use client';

import { useState, useRef, useCallback, useTransition } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { saveFile } from '@/app/edit/actions';

interface MarkdownEditorProps {
  content: string;
  filePath: string;
}

type FormatAction =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bold'
  | 'italic'
  | 'code'
  | 'codeblock'
  | 'ul'
  | 'ol'
  | 'link'
  | 'image';

export default function MarkdownEditor({ content, filePath }: MarkdownEditorProps) {
  const [markdown, setMarkdown] = useState(content);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = useCallback((action: FormatAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.slice(start, end);
    let insertion = '';
    let cursorOffset = 0;

    switch (action) {
      case 'h1':
        insertion = `# ${selected || 'Heading 1'}`;
        cursorOffset = selected ? insertion.length : 2;
        break;
      case 'h2':
        insertion = `## ${selected || 'Heading 2'}`;
        cursorOffset = selected ? insertion.length : 3;
        break;
      case 'h3':
        insertion = `### ${selected || 'Heading 3'}`;
        cursorOffset = selected ? insertion.length : 4;
        break;
      case 'bold':
        insertion = `**${selected || 'bold text'}**`;
        cursorOffset = selected ? insertion.length : 2;
        break;
      case 'italic':
        insertion = `*${selected || 'italic text'}*`;
        cursorOffset = selected ? insertion.length : 1;
        break;
      case 'code':
        insertion = `\`${selected || 'code'}\``;
        cursorOffset = selected ? insertion.length : 1;
        break;
      case 'codeblock':
        insertion = `\n\`\`\`\n${selected || 'code here'}\n\`\`\`\n`;
        cursorOffset = selected ? insertion.length : 5;
        break;
      case 'ul':
        insertion = `\n- ${selected || 'list item'}`;
        cursorOffset = selected ? insertion.length : 3;
        break;
      case 'ol':
        insertion = `\n1. ${selected || 'list item'}`;
        cursorOffset = selected ? insertion.length : 4;
        break;
      case 'link':
        insertion = selected ? `[${selected}](url)` : `[link text](url)`;
        cursorOffset = selected ? insertion.length - 4 : 1;
        break;
      case 'image':
        insertion = selected ? `![${selected}](url)` : `![alt text](url)`;
        cursorOffset = selected ? insertion.length - 4 : 2;
        break;
    }

    const newContent = markdown.slice(0, start) + insertion + markdown.slice(end);
    setMarkdown(newContent);

    // Restore cursor position after state update
    requestAnimationFrame(() => {
      textarea.focus();
      const newCursorPos = start + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  }, [markdown]);

  const handleSave = useCallback(() => {
    setSaveState('saving');
    startTransition(async () => {
      try {
        await saveFile(filePath, markdown);
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 2000);
      } catch (error) {
        console.error('Failed to save file:', error);
        setSaveState('idle');
      }
    });
  }, [filePath, markdown]);

  return (
    <div className="flex flex-col h-full min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-wrap">
        <ToolbarButton label="H1" onClick={() => insertFormatting('h1')} />
        <ToolbarButton label="H2" onClick={() => insertFormatting('h2')} />
        <ToolbarButton label="H3" onClick={() => insertFormatting('h3')} />
        <ToolbarDivider />
        <ToolbarButton label="B" onClick={() => insertFormatting('bold')} className="font-bold" />
        <ToolbarButton label="I" onClick={() => insertFormatting('italic')} className="italic" />
        <ToolbarButton label="Code" onClick={() => insertFormatting('code')} />
        <ToolbarButton label="{ }" onClick={() => insertFormatting('codeblock')} />
        <ToolbarDivider />
        <ToolbarButton label="• List" onClick={() => insertFormatting('ul')} />
        <ToolbarButton label="1. List" onClick={() => insertFormatting('ol')} />
        <ToolbarDivider />
        <ToolbarButton label="Link" onClick={() => insertFormatting('link')} />
        <ToolbarButton label="Image" onClick={() => insertFormatting('image')} />

        <div className="ml-auto flex items-center gap-3">
          {saveState === 'saving' && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Saving...</span>
          )}
          {saveState === 'saved' && (
            <span className="text-xs text-green-600 dark:text-green-400">Saved</span>
          )}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Editor and Preview Panes */}
      <div className="flex flex-1 min-h-0">
        {/* Editor Pane */}
        <div className="flex-1 flex flex-col border-r border-zinc-200 dark:border-zinc-800">
          <div className="px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            Editor
          </div>
          <textarea
            ref={textareaRef}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="flex-1 w-full p-4 font-mono text-sm resize-none bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none"
            spellCheck={false}
            placeholder="Start writing Markdown..."
          />
        </div>

        {/* Preview Pane */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            Preview
          </div>
          <div className="flex-1 overflow-y-auto p-4 prose prose-zinc dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  className = '',
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 text-xs rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors ${className}`}
    >
      {label}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-700 mx-1" />;
}
