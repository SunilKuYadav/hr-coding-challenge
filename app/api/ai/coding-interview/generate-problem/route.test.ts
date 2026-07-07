/**
 * Unit tests for the generate-problem API route.
 *
 * Tests validate that:
 * - A valid AI response is assembled, validated, and returned as 200 with a RichProblem.
 * - A malformed AI response causes a 502 with structured Zod validation issues.
 *
 * Requirements: 5.1, 5.2, 5.3
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// ---------------------------------------------------------------------------
// Mock the AI client so tests never hit a real server
// ---------------------------------------------------------------------------

vi.mock('@/ai', () => ({
  createAIClient: vi.fn(),
}));

import { createAIClient } from '@/ai';

// ---------------------------------------------------------------------------
// Helper: build a NextRequest with a JSON body
// ---------------------------------------------------------------------------

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/ai/coding-interview/generate-problem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Helper: make the mock AI client stream back a single JSON string
// ---------------------------------------------------------------------------

function mockAIResponse(jsonString: string): void {
  const mockCreateAIClient = vi.mocked(createAIClient);
  mockCreateAIClient.mockReturnValue({
    isAvailable: vi.fn().mockResolvedValue(true),
    generate: async function* () {
      yield jsonString;
    },
  });
}

// ---------------------------------------------------------------------------
// Valid AI core output — contains every required AICoreOutput field
// ---------------------------------------------------------------------------

const VALID_AI_RESPONSE = JSON.stringify({
  title: 'Two Sum',
  difficulty: 'easy',
  category: 'Arrays',
  tags: ['hash-map', 'arrays'],
  statement:
    'Given an array of integers nums and integer target, return indices of the two numbers such that they add up to target.',
  constraints: ['2 <= nums.length <= 10^4'],
  inputFormat: 'Array of integers and a target integer',
  outputFormat: 'Array of two indices',
  samples: [
    {
      input: '[2,7,11,15], target=9',
      output: '[0,1]',
      explanation: 'nums[0] + nums[1] = 2 + 7 = 9',
    },
    {
      input: '[3,2,4], target=6',
      output: '[1,2]',
      explanation: 'nums[1] + nums[2] = 2 + 4 = 6',
    },
  ],
  edgeCases: [
    {
      description: 'Same element twice',
      input: '[3,3], target=6',
      expectedOutput: '[0,1]',
    },
    {
      description: 'Negative numbers',
      input: '[-1,-2,-3,-4], target=-7',
      expectedOutput: '[2,3]',
    },
  ],
  hiddenTestCases: [
    { input: { nums: [2, 7], target: 9 }, expectedOutput: [0, 1] },
    { input: { nums: [3, 2, 4], target: 6 }, expectedOutput: [1, 2] },
    { input: { nums: [3, 3], target: 6 }, expectedOutput: [0, 1] },
    { input: { nums: [1, 2, 3, 4], target: 7 }, expectedOutput: [2, 3] },
    { input: { nums: [-1, 0], target: -1 }, expectedOutput: [0, 1] },
  ],
  expectedTimeComplexity: 'O(n)',
  expectedSpaceComplexity: 'O(n)',
  companyTags: ['Google', 'Amazon'],
  functionSignature: {
    name: 'twoSum',
    parameters: [
      { name: 'nums', type: 'number[]' },
      { name: 'target', type: 'number' },
    ],
    returnType: 'number[]',
  },
  hints: [
    { level: 1, content: 'Think about using a hash map' },
    { level: 2, content: 'Store complements in the hash map' },
    { level: 3, content: 'For each element, check if its complement exists' },
    { level: 4, content: 'Store the index as the value in the hash map' },
  ],
  interviewMetadata: {
    expectedPatterns: ['hash-map', 'two-pass'],
    followUpTopics: ['space complexity tradeoffs'],
    commonMistakes: ['Using O(n^2) brute force'],
    optimizationQuestions: ['Can you do it in O(n)?'],
  },
});

// ---------------------------------------------------------------------------
// Malformed AI response — missing the required `hints` field
// ---------------------------------------------------------------------------

const MALFORMED_AI_RESPONSE = JSON.stringify({
  title: 'Two Sum',
  difficulty: 'invalid-level', // invalid enum value
  category: 'Arrays',
  tags: ['hash-map', 'arrays'],
  statement: 'Given an array of integers, return indices of the two numbers that add up to target.',
  constraints: ['2 <= nums.length <= 10^4'],
  inputFormat: 'Array of integers and a target integer',
  outputFormat: 'Array of two indices',
  samples: [
    { input: '[2,7,11,15], target=9', output: '[0,1]', explanation: 'Adds to 9' },
    { input: '[3,2,4], target=6', output: '[1,2]', explanation: 'Adds to 6' },
  ],
  edgeCases: [
    { description: 'Same element twice', input: '[3,3], target=6', expectedOutput: '[0,1]' },
    { description: 'Negative numbers', input: '[-1,-2], target=-3', expectedOutput: '[0,1]' },
  ],
  hiddenTestCases: [
    { input: { nums: [2, 7], target: 9 }, expectedOutput: [0, 1] },
    { input: { nums: [3, 2, 4], target: 6 }, expectedOutput: [1, 2] },
    { input: { nums: [3, 3], target: 6 }, expectedOutput: [0, 1] },
    { input: { nums: [1, 2, 3, 4], target: 7 }, expectedOutput: [2, 3] },
    { input: { nums: [-1, 0], target: -1 }, expectedOutput: [0, 1] },
  ],
  expectedTimeComplexity: 'O(n)',
  expectedSpaceComplexity: 'O(n)',
  companyTags: ['Google'],
  functionSignature: {
    name: 'twoSum',
    parameters: [{ name: 'nums', type: 'number[]' }, { name: 'target', type: 'number' }],
    returnType: 'number[]',
  },
  // `hints` field is intentionally omitted — will cause assembly/validation failure
  interviewMetadata: {
    expectedPatterns: ['hash-map'],
    followUpTopics: ['space complexity'],
    commonMistakes: ['brute force'],
    optimizationQuestions: ['Can you do it in O(n)?'],
  },
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/ai/coding-interview/generate-problem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Requirement 5.1 & 5.3: valid response → 200 with RichProblem ─────────

  it('returns 200 with a valid RichProblem when AI response is well-formed', async () => {
    mockAIResponse(VALID_AI_RESPONSE);

    const req = makeRequest({ source: 'practice' });
    const response = await POST(req);

    expect(response.status).toBe(200);

    const body = await response.json() as Record<string, unknown>;

    // Core identity fields
    expect(body.title).toBe('Two Sum');
    expect(body.difficulty).toBe('easy');
    expect(body.category).toBe('Arrays');

    // Rich fields assembled server-side
    expect(typeof body.starterCode).toBe('string');
    expect((body.starterCode as string).length).toBeGreaterThan(0);
    expect(typeof body.providedCode).toBe('string');
    expect(typeof body.boilerplate).toBe('string');

    // Structured schema fields
    expect(body.functionSignature).toBeDefined();
    expect((body.functionSignature as Record<string, unknown>).name).toBe('twoSum');
    expect(body.parser).toBeDefined();
    expect(body.validator).toBeDefined();
    expect(body.executionConfig).toBeDefined();
    expect(Array.isArray(body.hints)).toBe(true);
    expect((body.hints as unknown[]).length).toBeGreaterThanOrEqual(1);
    expect(body.interviewMetadata).toBeDefined();
  });

  it('returns starterCode containing the function name and parameter names', async () => {
    mockAIResponse(VALID_AI_RESPONSE);

    const req = makeRequest({ source: 'practice' });
    const response = await POST(req);
    const body = await response.json() as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body.starterCode as string).toContain('twoSum');
    expect(body.starterCode as string).toContain('nums');
    expect(body.starterCode as string).toContain('target');
  });

  it('returns boilerplate as a non-empty string that contains starterCode', async () => {
    mockAIResponse(VALID_AI_RESPONSE);

    const req = makeRequest({ source: 'practice' });
    const response = await POST(req);
    const body = await response.json() as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(typeof body.boilerplate).toBe('string');
    expect((body.boilerplate as string).length).toBeGreaterThan(0);
    // Boilerplate is derived from providedCode + helperFunctions + starterCode
    expect(body.boilerplate as string).toContain(body.starterCode as string);
  });

  // ─── Requirement 5.2: malformed response → 502 with structured error ──────

  it('returns 502 with error and issues when AI response is malformed', async () => {
    mockAIResponse(MALFORMED_AI_RESPONSE);

    const req = makeRequest({ source: 'practice' });
    const response = await POST(req);

    expect(response.status).toBe(502);

    const body = await response.json() as Record<string, unknown>;

    // Must include a descriptive error message
    expect(typeof body.error).toBe('string');
    expect((body.error as string).length).toBeGreaterThan(0);
  });

  // ─── 400 on missing/invalid source field ─────────────────────────────────

  it('returns 400 when source field is missing', async () => {
    mockAIResponse(VALID_AI_RESPONSE);

    const req = makeRequest({});
    const response = await POST(req);

    expect(response.status).toBe(400);
    const body = await response.json() as Record<string, unknown>;
    expect(body.error).toContain('source');
  });

  it('returns 400 when source is an invalid value', async () => {
    mockAIResponse(VALID_AI_RESPONSE);

    const req = makeRequest({ source: 'bogus-source' });
    const response = await POST(req);

    expect(response.status).toBe(400);
    const body = await response.json() as Record<string, unknown>;
    expect(body.error).toContain('Invalid source');
  });

  // ─── 502 on non-JSON AI response ──────────────────────────────────────────

  it('returns 502 when AI response is not valid JSON', async () => {
    mockAIResponse('This is not JSON at all');

    const req = makeRequest({ source: 'practice' });
    const response = await POST(req);

    expect(response.status).toBe(502);
    const body = await response.json() as Record<string, unknown>;
    expect(typeof body.error).toBe('string');
  });
});
