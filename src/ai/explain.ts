/**
 * AI-powered explanation, similar problem suggestion, and interview prep.
 *
 * Provides:
 * - `explainConcept()`: streaming explanation of a concept
 * - `suggestSimilarProblems()`: list of related problems based on metadata
 * - `generateInterviewPrep()`: streaming interview preparation guidance
 *
 * Requirements: 5.4, 5.5
 */

import type { Problem } from '@/types';
import type { OllamaClient } from './client';

/**
 * Streams an explanation of a concept given surrounding context.
 *
 * @param concept - The concept to explain
 * @param context - Additional context around the concept
 * @param client - The OllamaClient instance to use
 * @yields String chunks of the explanation
 */
export async function* explainConcept(
  concept: string,
  context: string,
  client: OllamaClient
): AsyncGenerator<string> {
  const available = await client.isAvailable();
  if (!available) {
    yield 'AI is currently unavailable. Please ensure Ollama is running at localhost:11434.';
    return;
  }

  const prompt = `Explain the following concept clearly and concisely for someone preparing for technical interviews. Include examples where helpful. Format in Markdown.

Concept: ${concept}

Context:
${context}

Explanation:`;

  try {
    for await (const chunk of client.generate(prompt)) {
      yield chunk;
    }
  } catch {
    yield '\n\n[Error: Explanation generation failed. Please try again.]';
  }
}

/**
 * Suggests similar problems based on the given problem's metadata.
 *
 * @param problem - The Problem to find similar items for
 * @param client - The OllamaClient instance to use
 * @returns Array of problem name suggestions, or empty array on failure
 */
export async function suggestSimilarProblems(
  problem: Problem,
  client: OllamaClient
): Promise<string[]> {
  try {
    const available = await client.isAvailable();
    if (!available) {
      return [];
    }

    const prompt = `Given the following coding problem metadata, suggest 5 similar problems that would help practice the same patterns and concepts.

Problem: ${problem.title}
Platform: ${problem.platform}
Difficulty: ${problem.difficulty}
Patterns: ${problem.patterns.join(', ')}
Companies: ${problem.companies.join(', ')}

Return ONLY a valid JSON array of problem name strings (no additional text):
["Problem Name 1", "Problem Name 2", "Problem Name 3", "Problem Name 4", "Problem Name 5"]

JSON:`;

    let fullResponse = '';
    for await (const chunk of client.generate(prompt)) {
      fullResponse += chunk;
    }

    return parseSuggestions(fullResponse);
  } catch {
    return [];
  }
}

/**
 * Streams interview preparation content for the given problem.
 *
 * @param problem - The Problem to prepare for
 * @param client - The OllamaClient instance to use
 * @yields String chunks of the interview prep content
 */
export async function* generateInterviewPrep(
  problem: Problem,
  client: OllamaClient
): AsyncGenerator<string> {
  const available = await client.isAvailable();
  if (!available) {
    yield 'AI is currently unavailable. Please ensure Ollama is running at localhost:11434.';
    return;
  }

  const prompt = `Generate interview preparation material for the following coding problem. Include:
1. Key questions an interviewer might ask
2. Hints for approaching the problem
3. Common follow-up questions
4. Edge cases to consider
5. Time and space complexity discussion points

Format in Markdown with clear sections.

Problem: ${problem.title}
Platform: ${problem.platform}
Difficulty: ${problem.difficulty}
Patterns: ${problem.patterns.join(', ')}

Interview Prep:`;

  try {
    for await (const chunk of client.generate(prompt)) {
      yield chunk;
    }
  } catch {
    yield '\n\n[Error: Interview prep generation failed. Please try again.]';
  }
}

/**
 * Parses a response string into an array of suggestion strings.
 */
function parseSuggestions(response: string): string[] {
  try {
    const trimmed = response.trim();
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    // Fall through
  }

  // Try extracting from code block
  const codeBlockMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string');
      }
    } catch {
      // Fall through
    }
  }

  // Try to find JSON array
  const arrayMatch = response.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string');
      }
    } catch {
      // Give up
    }
  }

  return [];
}
