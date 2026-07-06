'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveAIContent } from '../ai-actions';
import { useAIStatus } from '@/src/providers/AIProvider';
import { logInput, logOutput, logError } from '@/src/ai/logger';

import type { ActionConfig } from './types';
import {
  TOPIC_ACTIONS,
  PROBLEM_ACTIONS,
  TOPIC_PROMPT_HELPERS,
  PROBLEM_PROMPT_HELPERS,
} from './constants';
import { detectGeneralQuestion } from './utils';

interface UseAISidebarParams {
  context: 'topic' | 'problem';
  itemId: string;
  available?: boolean;
}

export function useAISidebar({ context, itemId, available: availableProp }: UseAISidebarParams) {
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

  const handleOpenInEditor = useCallback(async () => {
    if (!activeAction) return;
    const result = await saveAIContent(itemId, context, output, activeAction.filename);
    if (result.success && result.path) {
      router.push(`/edit/${result.path}`);
    }
  }, [activeAction, output, itemId, context, router]);

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

  return {
    // State
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

    // Actions
    setCollapsed,
    setCustomPrompt,
    setShowHelpers,
    handleResizeStart,
    handleAction,
    handleSave,
    handleOpenInEditor,
    handleCustomPrompt,
  };
}
