/**
 * API route for AI-powered interactive review sessions.
 *
 * Generates contextual review questions based on item type (topic/problem),
 * evaluates user responses, and provides feedback with confidence scoring.
 *
 * Actions:
 * - generate: Generate review questions for an item
 * - evaluate: Evaluate user's response and provide feedback
 * - hint: Provide a hint for the current question
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAIClient } from '@/ai';
import { getWorkspacePath } from '@/src/lib/constants';
import { FileTopicRepository } from '@/src/filesystem/FileTopicRepository';
import { FileProblemRepository } from '@/src/filesystem/FileProblemRepository';

const DEFAULT_BASE_URL = process.env.OPENAI_BASE_URL || 'http://127.0.0.1:1234/v1';
const API_KEY = process.env.OPENAI_API_KEY || '';
const MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, itemId, itemType, confidence, question, userResponse, questionType } = body as {
      action: string;
      itemId: string;
      itemType: 'topic' | 'problem';
      confidence?: number;
      question?: string;
      userResponse?: string;
      questionType?: string;
    };

    if (!action || !itemId || !itemType) {
      return NextResponse.json(
        { error: 'Missing required fields: action, itemId, itemType' },
        { status: 400 }
      );
    }

    const client = createAIClient({ baseUrl: DEFAULT_BASE_URL, apiKey: API_KEY, defaultModel: MODEL });
    const workspacePath = getWorkspacePath();

    if (action === 'generate') {
      const content = await getItemContent(itemId, itemType, workspacePath);
      if (!content) {
        return NextResponse.json({ error: 'Item content not found' }, { status: 404 });
      }

      const prompt = buildReviewPrompt(content, itemType, confidence || 3);

      // Try streaming generation first
      let fullResponse = '';
      for await (const chunk of client.generate(prompt)) {
        fullResponse += chunk;
      }

      // If streaming returned nothing, try a non-streaming request as fallback
      if (!fullResponse.trim()) {
        try {
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`;

          const fallbackRes = await fetch(`${DEFAULT_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              model: MODEL,
              messages: [{ role: 'user', content: prompt }],
              stream: false,
            }),
          });

          if (fallbackRes.ok) {
            const json = await fallbackRes.json() as {
              choices?: Array<{ message?: { content?: string } }>;
            };
            fullResponse = json.choices?.[0]?.message?.content || '';
          }
        } catch {
          // Fallback also failed
        }
      }

      if (!fullResponse.trim()) {
        return NextResponse.json({ questions: [], rawResponse: '(empty response from AI)' });
      }

      const questions = parseReviewQuestions(fullResponse);
      if (questions.length === 0 && fullResponse.trim().length > 0) {
        // Parsing failed but we got a response — return debug info
        return NextResponse.json({ questions: [], rawResponse: fullResponse.slice(0, 500) });
      }
      return NextResponse.json({ questions });
    }

    if (action === 'evaluate') {
      if (!question || !userResponse) {
        return NextResponse.json(
          { error: 'Missing required fields: question, userResponse' },
          { status: 400 }
        );
      }

      const content = await getItemContent(itemId, itemType, workspacePath);
      const prompt = buildEvaluationPrompt(
        question,
        userResponse,
        questionType || 'conceptual',
        content || '',
        itemType
      );

      let fullResponse = '';
      for await (const chunk of client.generate(prompt)) {
        fullResponse += chunk;
      }

      // Non-streaming fallback
      if (!fullResponse.trim()) {
        fullResponse = await nonStreamingFallback(prompt);
      }

      const evaluation = parseEvaluation(fullResponse);
      return NextResponse.json(evaluation);
    }

    if (action === 'hint') {
      if (!question) {
        return NextResponse.json(
          { error: 'Missing required field: question' },
          { status: 400 }
        );
      }

      const content = await getItemContent(itemId, itemType, workspacePath);
      const prompt = buildHintPrompt(question, questionType || 'conceptual', content || '');

      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of client.generate(prompt)) {
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

    if (action === 'session-summary') {
      const { answers } = body as { answers: Array<{ question: string; response: string; score: number; mistakes: string[] }> };
      if (!answers || !Array.isArray(answers)) {
        return NextResponse.json({ error: 'Missing answers array' }, { status: 400 });
      }

      const content = await getItemContent(itemId, itemType, workspacePath);
      const prompt = buildSessionSummaryPrompt(answers, content || '', itemType);

      let fullResponse = '';
      for await (const chunk of client.generate(prompt)) {
        fullResponse += chunk;
      }

      // Non-streaming fallback
      if (!fullResponse.trim()) {
        fullResponse = await nonStreamingFallback(prompt);
      }

      const summary = parseSessionSummary(fullResponse);
      return NextResponse.json(summary);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/* ─── Content Fetching ─── */

/**
 * Non-streaming fallback for when the streaming AI client returns empty.
 * Makes a standard (non-SSE) request to the OpenAI-compatible endpoint.
 */
async function nonStreamingFallback(prompt: string): Promise<string> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`;

    const res = await fetch(`${DEFAULT_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }),
    });

    if (res.ok) {
      const json = await res.json() as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      return json.choices?.[0]?.message?.content || '';
    }
  } catch {
    // Fallback failed
  }
  return '';
}

async function getItemContent(
  itemId: string,
  itemType: 'topic' | 'problem',
  workspacePath: string
): Promise<string | null> {
  if (itemType === 'topic') {
    const topicRepo = new FileTopicRepository(workspacePath);
    const topic = await topicRepo.getById(itemId);
    if (!topic) return null;

    const [overview, notes, patterns] = await Promise.all([
      topicRepo.getContent(itemId, 'overview'),
      topicRepo.getContent(itemId, 'notes'),
      topicRepo.getContent(itemId, 'patterns'),
    ]);
    return `Topic: ${topic.title}\nCategory: ${topic.category}\nDifficulty: ${topic.difficulty}\n\nOverview:\n${overview}\n\nNotes:\n${notes}\n\nPatterns:\n${patterns}`.trim();
  } else {
    const problemRepo = new FileProblemRepository(workspacePath);
    const problem = await problemRepo.getById(itemId);
    if (!problem) return null;

    const [notes, solution] = await Promise.all([
      problemRepo.getNotes(itemId),
      problemRepo.getSolution(itemId),
    ]);
    return `Problem: ${problem.title}\nPlatform: ${problem.platform}\nDifficulty: ${problem.difficulty}\nPatterns: ${problem.patterns.join(', ')}\n\nNotes:\n${notes}\n\nSolution:\n${solution}`.trim();
  }
}

/* ─── Prompt Builders ─── */

function buildReviewPrompt(content: string, itemType: 'topic' | 'problem', confidence: number): string {
  const difficultyLevel = confidence <= 2 ? 'basic' : confidence <= 3 ? 'intermediate' : 'advanced';
  
  const questionTypes = itemType === 'problem'
    ? `Mix of:
- "code": Ask the user to write code or pseudocode solving a variation of the problem
- "conceptual": Ask about the approach, time/space complexity, or trade-offs
- "debug": Show a buggy code snippet and ask them to identify/fix the issue
- "edge-case": Ask about edge cases or boundary conditions`
    : `Mix of:
- "conceptual": Ask about key concepts, definitions, or how things work
- "application": Ask to apply the concept to a scenario
- "comparison": Ask to compare/contrast related concepts
- "code": Ask to write a small code snippet demonstrating the concept`;

  return `You are an expert coding interviewer conducting a spaced-repetition review session.

The user's current confidence level is ${confidence}/5 (${difficultyLevel}). Adjust question difficulty accordingly:
- For confidence 1-2: Focus on fundamentals, definitions, basic recall
- For confidence 3: Mix of recall and application
- For confidence 4-5: Advanced application, edge cases, optimization, trade-offs

Generate exactly 3 review questions based on the following content.

Question types to include:
${questionTypes}

Content to review:
${content}

Return ONLY a valid JSON array with this exact structure (no additional text, no markdown):
[
  {
    "type": "conceptual|code|debug|edge-case|application|comparison",
    "question": "The question text...",
    "expectedAnswer": "A concise expected answer or key points the response should cover",
    "difficulty": "basic|intermediate|advanced"
  }
]

JSON:`;
}
function buildEvaluationPrompt(
  question: string,
  userResponse: string,
  questionType: string,
  content: string,
  itemType: string
): string {
  return `You are an expert coding mentor evaluating a student's response during a review session.

Context (${itemType}):
${content}

Question (type: ${questionType}):
${question}

Student's Response:
${userResponse}

Evaluate the response and provide:
1. A score from 1-5 (1=completely wrong, 2=mostly wrong, 3=partially correct, 4=mostly correct, 5=perfect)
2. A list of specific mistakes or gaps in understanding
3. The correct/ideal answer
4. Key insights they should remember

Return ONLY valid JSON with this exact structure (no additional text, no markdown):
{
  "score": 4,
  "mistakes": ["Mistake 1", "Mistake 2"],
  "correctAnswer": "The ideal answer...",
  "keyInsights": ["Insight 1", "Insight 2"],
  "feedback": "Brief encouraging feedback explaining what was good and what to improve"
}

JSON:`;
}

function buildHintPrompt(question: string, questionType: string, content: string): string {
  return `You are a helpful coding mentor. The student is stuck on a review question and needs a hint.

Question (type: ${questionType}):
${question}

Reference material:
${content}

Provide a helpful hint that guides them toward the answer without giving it away directly. Be concise (2-3 sentences). Point them in the right direction.

Hint:`;
}

function buildSessionSummaryPrompt(
  answers: Array<{ question: string; response: string; score: number; mistakes: string[] }>,
  content: string,
  itemType: string
): string {
  const answersText = answers.map((a, i) =>
    `Q${i + 1}: ${a.question}\nResponse: ${a.response}\nScore: ${a.score}/5\nMistakes: ${a.mistakes.join('; ') || 'None'}`
  ).join('\n\n');

  return `You are an expert coding mentor providing a session summary after a review.

Item type: ${itemType}
Reference content:
${content}

Session results:
${answersText}

Based on the session, provide:
1. An overall confidence score recommendation (1-5) for updating the spaced repetition schedule
2. A list of all mistakes made across the session (consolidated, no duplicates)
3. Key areas to focus on for next review
4. A brief encouraging summary

Return ONLY valid JSON with this exact structure (no additional text, no markdown):
{
  "recommendedConfidence": 4,
  "allMistakes": ["Consolidated mistake 1", "Consolidated mistake 2"],
  "focusAreas": ["Area to focus on 1", "Area to focus on 2"],
  "summary": "Brief encouraging summary of performance"
}

JSON:`;
}

/* ─── Response Parsers ─── */

interface ReviewQuestion {
  type: string;
  question: string;
  expectedAnswer: string;
  difficulty: string;
}

function parseReviewQuestions(response: string): ReviewQuestion[] {
  const parsed = extractJsonArray(response);
  if (!parsed) return [];
  return validateQuestions(parsed);
}

/**
 * Attempts to extract a JSON array from a response string.
 * Handles cases where the model wraps JSON in markdown code blocks or extra text.
 */
function extractJsonArray(response: string): unknown[] | null {
  // Try direct parse first
  try {
    const trimmed = response.trim();
    const directParse = JSON.parse(trimmed);
    if (Array.isArray(directParse)) return directParse;
  } catch { /* fall through */ }

  // Try to extract from markdown code block
  const codeBlockMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (Array.isArray(parsed)) return parsed;
    } catch { /* fall through */ }
  }

  // Try to find JSON array in response (greedy - find the largest array)
  const arrayMatch = response.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* fall through */ }
  }

  // Try to find from first [ to last ]
  const firstBracket = response.indexOf('[');
  const lastBracket = response.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      const substr = response.slice(firstBracket, lastBracket + 1);
      const parsed = JSON.parse(substr);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* fall through */ }
  }

  return null;
}

function validateQuestions(items: unknown[]): ReviewQuestion[] {
  return items
    .filter((item): item is Record<string, unknown> =>
      !!item && typeof item === 'object' && 'question' in item
    )
    .map((item) => ({
      type: String(item.type || 'conceptual'),
      question: String(item.question),
      expectedAnswer: String(item.expectedAnswer || item.expected_answer || item.answer || ''),
      difficulty: String(item.difficulty || 'intermediate'),
    }));
}

interface EvaluationResult {
  score: number;
  mistakes: string[];
  correctAnswer: string;
  keyInsights: string[];
  feedback: string;
}

function parseEvaluation(response: string): EvaluationResult {
  const defaultResult: EvaluationResult = {
    score: 3,
    mistakes: [],
    correctAnswer: '',
    keyInsights: [],
    feedback: 'Unable to evaluate response.',
  };

  try {
    const trimmed = response.trim();
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') return validateEvaluation(parsed);
  } catch { /* fall through */ }

  const codeBlockMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (parsed && typeof parsed === 'object') return validateEvaluation(parsed);
    } catch { /* fall through */ }
  }

  const objMatch = response.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      const parsed = JSON.parse(objMatch[0]);
      if (parsed && typeof parsed === 'object') return validateEvaluation(parsed);
    } catch { /* fall through */ }
  }

  return defaultResult;
}

function validateEvaluation(obj: Record<string, unknown>): EvaluationResult {
  return {
    score: typeof obj.score === 'number' ? Math.min(5, Math.max(1, obj.score)) : 3,
    mistakes: Array.isArray(obj.mistakes) ? obj.mistakes.map(String) : [],
    correctAnswer: typeof obj.correctAnswer === 'string' ? obj.correctAnswer : '',
    keyInsights: Array.isArray(obj.keyInsights) ? obj.keyInsights.map(String) : [],
    feedback: typeof obj.feedback === 'string' ? obj.feedback : '',
  };
}

interface SessionSummary {
  recommendedConfidence: number;
  allMistakes: string[];
  focusAreas: string[];
  summary: string;
}

function parseSessionSummary(response: string): SessionSummary {
  const defaultSummary: SessionSummary = {
    recommendedConfidence: 3,
    allMistakes: [],
    focusAreas: [],
    summary: 'Session completed.',
  };

  try {
    const trimmed = response.trim();
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') return validateSummary(parsed);
  } catch { /* fall through */ }

  const codeBlockMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (parsed && typeof parsed === 'object') return validateSummary(parsed);
    } catch { /* fall through */ }
  }

  const objMatch = response.match(/\{[\s\S]*\}/);
  if (objMatch) {
    try {
      const parsed = JSON.parse(objMatch[0]);
      if (parsed && typeof parsed === 'object') return validateSummary(parsed);
    } catch { /* fall through */ }
  }

  return defaultSummary;
}

function validateSummary(obj: Record<string, unknown>): SessionSummary {
  return {
    recommendedConfidence: typeof obj.recommendedConfidence === 'number'
      ? Math.min(5, Math.max(1, obj.recommendedConfidence))
      : 3,
    allMistakes: Array.isArray(obj.allMistakes) ? obj.allMistakes.map(String) : [],
    focusAreas: Array.isArray(obj.focusAreas) ? obj.focusAreas.map(String) : [],
    summary: typeof obj.summary === 'string' ? obj.summary : 'Session completed.',
  };
}
