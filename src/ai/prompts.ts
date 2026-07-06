/**
 * Centralized AI prompts.
 *
 * All prompts used across the application are defined here for consistency
 * and easy maintenance. Each prompt is prefixed with the SYSTEM_CONTEXT
 * that sets the expectation level for senior engineering interviews.
 */

/**
 * Default system context prepended to all AI prompts.
 * Establishes the perspective of a senior software architect with 15+ years of experience.
 */
export const SYSTEM_CONTEXT = `You are an expert software architect and senior engineering mentor with more than 15 years of industry experience. You specialize in system design, distributed systems, data structures & algorithms, and software engineering best practices. Your explanations target candidates preparing for senior/staff-level engineering positions. Provide depth, nuance, and real-world context in your responses — cover trade-offs, scalability considerations, and production-grade thinking where relevant.

`;

/**
 * Builds a full prompt by prepending the system context.
 */
export function withContext(prompt: string): string {
  return SYSTEM_CONTEXT + prompt;
}

/* ─── Summary ─── */

export function buildSummaryPrompt(content: string): string {
  return withContext(
    `Summarize the following technical content concisely. Focus on key concepts, important details, and main takeaways. Format the summary in Markdown with bullet points for clarity.

Content:
${content}

Summary:`
  );
}

/* ─── Explain Concept ─── */

export function buildExplainPrompt(concept: string, context: string): string {
  return withContext(
    `Explain the following concept clearly and concisely for someone preparing for technical interviews. Include examples where helpful. Format in Markdown.

Concept: ${concept}

Context:
${context}

Explanation:`
  );
}

/* ─── Interview Prep ─── */

export function buildInterviewPrepPrompt(
  title: string,
  platform: string,
  difficulty: string,
  patterns: string
): string {
  return withContext(
    `Generate interview preparation material for the following coding problem. Include:
1. Key questions an interviewer might ask
2. Hints for approaching the problem
3. Common follow-up questions
4. Edge cases to consider
5. Time and space complexity discussion points

Format in Markdown with clear sections.

Problem: ${title}
Platform: ${platform}
Difficulty: ${difficulty}
Patterns: ${patterns}

Interview Prep:`
  );
}

/* ─── Similar Problems ─── */

export function buildSimilarProblemsPrompt(
  title: string,
  platform: string,
  difficulty: string,
  patterns: string,
  companies: string
): string {
  return withContext(
    `Given the following coding problem metadata, suggest 5 similar problems that would help practice the same patterns and concepts.

Problem: ${title}
Platform: ${platform}
Difficulty: ${difficulty}
Patterns: ${patterns}
Companies: ${companies}

Return ONLY a valid JSON array of problem name strings (no additional text):
["Problem Name 1", "Problem Name 2", "Problem Name 3", "Problem Name 4", "Problem Name 5"]

JSON:`
  );
}

/* ─── Quiz Generation ─── */

export function buildQuizPrompt(content: string): string {
  return withContext(
    `Generate 5 multiple-choice quiz questions based on the following technical content. Each question should test understanding of key concepts.

Return ONLY a valid JSON array with this exact structure (no additional text):
[
  {
    "question": "What is...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "The correct answer is A because..."
  }
]

Content:
${content}

JSON:`
  );
}

/* ─── Flashcard Generation ─── */

export function buildFlashcardsPrompt(content: string): string {
  return withContext(
    `Generate 5-10 flashcards based on the following technical content. Each flashcard should have a question/concept on the front and a concise answer/explanation on the back.

Return ONLY a valid JSON array with this exact structure (no additional text):
[
  {
    "front": "What is the time complexity of binary search?",
    "back": "O(log n) because the search space is halved with each comparison.",
    "tags": ["binary-search", "complexity"]
  }
]

Content:
${content}

JSON:`
  );
}

/* ─── Form Parsing ─── */

export function buildTopicParsePrompt(text: string): string {
  return withContext(
    `You are a helpful assistant that extracts structured data from text descriptions.
Given the following text, extract topic information and return ONLY valid JSON (no markdown, no explanation) with these fields:
- title (string, required): The topic name
- category (string, one of: dsa, system-design, database, networking, os, oop)
- difficulty (string, one of: easy, medium, hard)
- tags (array of strings): relevant tags

If a field cannot be determined, omit it from the response.
Return ONLY the JSON object, nothing else.

Text: ${text}`
  );
}

export function buildProblemParsePrompt(text: string): string {
  return withContext(
    `You are a helpful assistant that extracts structured data from text descriptions.
Given the following text, extract coding problem information and return ONLY valid JSON (no markdown, no explanation) with these fields:
- title (string, required): The problem name
- platform (string, one of: leetcode, codeforces, gfg)
- difficulty (string, one of: easy, medium, hard)
- companies (array of strings): companies that ask this problem
- patterns (array of strings): algorithmic patterns used
- url (string): problem URL if mentioned

If a field cannot be determined, omit it from the response.
Return ONLY the JSON object, nothing else.

Text: ${text}`
  );
}

/* ─── Generate Text (Markdown Editor) ─── */

export function buildGenerateTextPrompt(userPrompt: string, context?: string): string {
  let prompt = `You are a helpful assistant that generates well-formatted Markdown content. Generate content based on the user's request. Output only the Markdown content with no additional commentary or wrapping.\n\n`;

  if (context) {
    prompt += `Here is the existing document context for reference:\n---\n${context}\n---\n\n`;
  }

  prompt += `User request: ${userPrompt}\n\nMarkdown output:`;

  return withContext(prompt);
}
