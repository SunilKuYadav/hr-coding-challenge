/**
 * AI-powered content summarization using Ollama.
 *
 * Streams a summary of the provided content as an async generator,
 * yielding string chunks as they arrive from the model.
 *
 * Requirements: 5.1
 */

import type { OllamaClient } from './client';

/**
 * Generates a streaming summary of the given content.
 *
 * @param content - The text content to summarize
 * @param client - The OllamaClient instance to use
 * @yields String chunks of the generated summary
 */
export async function* generateSummary(
  content: string,
  client: OllamaClient
): AsyncGenerator<string> {
  const available = await client.isAvailable();
  if (!available) {
    yield 'AI is currently unavailable. Please ensure Ollama is running at localhost:11434.';
    return;
  }

  const prompt = `Summarize the following technical content concisely. Focus on key concepts, important details, and main takeaways. Format the summary in Markdown with bullet points for clarity.

Content:
${content}

Summary:`;

  try {
    for await (const chunk of client.generate(prompt)) {
      yield chunk;
    }
  } catch {
    yield '\n\n[Error: Summary generation failed. Please try again.]';
  }
}
