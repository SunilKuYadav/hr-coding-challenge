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

/* ─── Custom Chat (Coding Tutor) ─── */

export function buildCustomGeneralPrompt(prompt: string): string {
  return `You are a helpful coding tutor. Answer the following question:\n\n${prompt}`;
}

export function buildCustomItemPrompt(
  prompt: string,
  contextType: string,
  contextContent: string
): string {
  return `You are a helpful coding tutor. The user is studying a ${contextType}. Here is the relevant context:\n\n${contextContent}\n\nUser question: ${prompt}`;
}

/* ─── Review Session ─── */

export function buildReviewPrompt(
  content: string,
  itemType: 'topic' | 'problem',
  confidence: number
): string {
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

export function buildEvaluationPrompt(
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

export function buildHintPrompt(
  question: string,
  questionType: string,
  content: string
): string {
  return `You are a helpful coding mentor. The student is stuck on a review question and needs a hint.

Question (type: ${questionType}):
${question}

Reference material:
${content}

Provide a helpful hint that guides them toward the answer without giving it away directly. Be concise (2-3 sentences). Point them in the right direction.

Hint:`;
}

export function buildSessionSummaryPrompt(
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

export function buildGenerateContentPrompt(
  answers: Array<{ question: string; questionType: string; response: string; score: number; mistakes: string[]; keyInsights: string[]; feedback: string; correctAnswer: string }>,
  existingContent: string,
  itemType: string,
  contentType: string
): string {
  const sessionData = answers.map((a, i) =>
    `Q${i + 1} (${a.questionType}): ${a.question}\nUser Answer: ${a.response}\nScore: ${a.score}/5\nCorrect Answer: ${a.correctAnswer}\nMistakes: ${a.mistakes.join('; ') || 'None'}\nKey Insights: ${a.keyInsights.join('; ') || 'None'}\nFeedback: ${a.feedback}`
  ).join('\n\n');

  const contentTypePrompts: Record<string, string> = {
    notes: `Generate updated/improved notes in Markdown format. Include key concepts, important details, and things the user should remember. Merge with any existing notes content — do not lose existing information, but add new insights from this session.`,
    mistakes: `Generate a consolidated list of common mistakes and pitfalls in Markdown format. Include mistakes from this session AND any from the existing content. Each mistake should have a brief explanation of why it's wrong and how to avoid it. Format as a clear list.`,
    patterns: `Generate coding patterns and approaches in Markdown format. Include patterns relevant to this topic/problem that were tested in the session. Merge with existing patterns. Each pattern should include when to use it and a brief example or explanation.`,
    solution: `Generate an improved solution explanation in Markdown format. Based on the review session Q&A, provide a clear solution approach with explanation. Include time/space complexity if relevant. Build upon existing solution content.`,
    flashcards: `Generate flashcards in Markdown format. Create Q&A pairs based on the review session insights and existing content. Format each as:\n\n### Card N\n**Q:** question\n**A:** answer\n\nFocus on key concepts, common mistakes, and important patterns that need to be memorized.`,
  };

  const instruction = contentTypePrompts[contentType] || contentTypePrompts.notes;

  return `You are an expert coding mentor generating study material based on a review session.

Item type: ${itemType}

Existing content for this item:
${existingContent || '(No existing content)'}

Review session Q&A:
${sessionData}

Task: ${instruction}

Generate the content in clean Markdown format. Be thorough, accurate, and practical.`;
}
