/**
 * API route for AI operations.
 *
 * POST handler accepts { action, itemId, content? } and routes to the
 * appropriate AI function. Streaming actions (summary, explain, interview)
 * return a ReadableStream. Non-streaming actions (quiz, flashcards, similar)
 * return JSON.
 *
 * Requirements: 13.1, 13.2
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createOllamaClient,
  generateSummary,
  generateQuiz,
  generateFlashcards,
  explainConcept,
  suggestSimilarProblems,
  generateInterviewPrep,
} from '@/ai';
import { getWorkspacePath } from '@/src/lib/constants';
import { FileTopicRepository } from '@/src/filesystem/FileTopicRepository';
import { FileProblemRepository } from '@/src/filesystem/FileProblemRepository';

const DEFAULT_OLLAMA_URL = 'http://localhost:11434';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, itemId, content } = body as {
      action: string;
      itemId: string;
      content?: string;
    };

    if (!action || !itemId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, itemId' },
        { status: 400 }
      );
    }

    const client = createOllamaClient(DEFAULT_OLLAMA_URL);
    const workspacePath = getWorkspacePath();

    // Streaming actions
    if (action === 'summary' || action === 'explain' || action === 'interview') {
      const generator = await getStreamingGenerator(
        action,
        itemId,
        content,
        client,
        workspacePath
      );

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of generator) {
              controller.enqueue(new TextEncoder().encode(chunk));
            }
            controller.close();
          } catch {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      });
    }

    // Non-streaming actions
    if (action === 'quiz') {
      const topicContent = content || await getTopicContent(itemId, workspacePath);
      const questions = await generateQuiz(topicContent, client);
      return NextResponse.json({ questions });
    }

    if (action === 'flashcards') {
      const topicContent = content || await getTopicContent(itemId, workspacePath);
      const cards = await generateFlashcards(topicContent, client);
      return NextResponse.json({ cards });
    }

    if (action === 'similar') {
      const problemRepo = new FileProblemRepository(workspacePath);
      const problem = await problemRepo.getById(itemId);
      if (!problem) {
        return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
      }
      const suggestions = await suggestSimilarProblems(problem, client);
      return NextResponse.json({ suggestions });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getStreamingGenerator(
  action: string,
  itemId: string,
  content: string | undefined,
  client: ReturnType<typeof createOllamaClient>,
  workspacePath: string
): Promise<AsyncGenerator<string>> {
  if (action === 'summary') {
    const topicContent = content || await getTopicContent(itemId, workspacePath);
    return generateSummary(topicContent, client);
  }

  if (action === 'explain') {
    const problemRepo = new FileProblemRepository(workspacePath);
    const problem = await problemRepo.getById(itemId);
    const solutionContent = problem
      ? await problemRepo.getSolution(itemId)
      : '';
    return explainConcept(
      problem?.title || itemId,
      solutionContent || content || '',
      client
    );
  }

  if (action === 'interview') {
    const problemRepo = new FileProblemRepository(workspacePath);
    const problem = await problemRepo.getById(itemId);
    if (!problem) {
      return (async function* () {
        yield 'Problem not found.';
      })();
    }
    return generateInterviewPrep(problem, client);
  }

  return (async function* () {
    yield 'Unknown action.';
  })();
}

async function getTopicContent(itemId: string, workspacePath: string): Promise<string> {
  const topicRepo = new FileTopicRepository(workspacePath);
  const [overview, notes] = await Promise.all([
    topicRepo.getContent(itemId, 'overview'),
    topicRepo.getContent(itemId, 'notes'),
  ]);
  return `${overview}\n\n${notes}`.trim();
}
