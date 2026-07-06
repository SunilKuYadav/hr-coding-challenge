'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MarkdownRendererProps {
  children: string;
  className?: string;
}

/**
 * Shared markdown renderer with syntax highlighting for code blocks.
 * Supports TypeScript, JavaScript, Python, Java, C++, and more.
 */
export function MarkdownRenderer({ children, className }: MarkdownRendererProps) {
  const content = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
    >
      {children}
    </ReactMarkdown>
  );

  if (className) {
    return <div className={className}>{content}</div>;
  }

  return content;
}
