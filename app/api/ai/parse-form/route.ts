/**
 * API route for AI-powered form data parsing.
 *
 * POST handler accepts { text, formType } and uses Ollama to extract
 * structured form data from a natural language description.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOllamaClient } from '@/ai';

const DEFAULT_OLLAMA_URL = 'http://localhost:11434';

const TOPIC_PROMPT = `You are a helpful assistant that extracts structured data from text descriptions.
Given the following text, extract topic information and return ONLY valid JSON (no markdown, no explanation) with these fields:
- title (string, required): The topic name
- category (string, one of: dsa, system-design, database, networking, os, oop)
- difficulty (string, one of: easy, medium, hard)
- tags (array of strings): relevant tags

If a field cannot be determined, omit it from the response.
Return ONLY the JSON object, nothing else.

Text: `;

const PROBLEM_PROMPT = `You are a helpful assistant that extracts structured data from text descriptions.
Given the following text, extract coding problem information and return ONLY valid JSON (no markdown, no explanation) with these fields:
- title (string, required): The problem name
- platform (string, one of: leetcode, codeforces, gfg)
- difficulty (string, one of: easy, medium, hard)
- companies (array of strings): companies that ask this problem
- patterns (array of strings): algorithmic patterns used
- url (string): problem URL if mentioned

If a field cannot be determined, omit it from the response.
Return ONLY the JSON object, nothing else.

Text: `;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, formType } = body as { text: string; formType: 'topic' | 'problem' };

    if (!text || !formType) {
      return NextResponse.json(
        { error: 'Missing required fields: text, formType' },
        { status: 400 }
      );
    }

    const client = createOllamaClient(DEFAULT_OLLAMA_URL);

    const isAvailable = await client.isAvailable();
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'AI service is not available. Make sure Ollama is running.' },
        { status: 503 }
      );
    }

    const prompt = formType === 'topic'
      ? TOPIC_PROMPT + text
      : PROBLEM_PROMPT + text;

    // Collect all tokens from the generator
    let result = '';
    for await (const token of client.generate(prompt)) {
      result += token;
    }

    // Try to parse the JSON response
    const trimmed = result.trim();
    // Strip markdown code fences if present
    const jsonStr = trimmed.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');

    try {
      const parsed = JSON.parse(jsonStr);
      return NextResponse.json({ data: parsed });
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid response. Please try again with a clearer description.' },
        { status: 422 }
      );
    }
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
