/**
 * Preservation Property Tests — Error Handling and Existing Field Validation Unchanged
 *
 * These tests verify the BASELINE behavior of the generate-problem route and
 * validateGeneratedProblem function on UNFIXED code. All tests must PASS.
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10**
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { NextRequest } from 'next/server';
import { validateGeneratedProblem } from '../lib/validateGeneratedProblem';

// Mock the AI client module
vi.mock('@/ai', () => ({
  createAIClient: vi.fn(() => ({
    isAvailable: vi.fn().mockResolvedValue(true),
    generate: vi.fn(),
  })),
}));

import { createAIClient } from '@/ai';
import { POST } from '@/app/api/ai/coding-interview/generate-problem/route';

const VALID_SOURCES = ['problem', 'topic', 'self-test', 'revision', 'practice', 'interview'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];
const VALID_LANGUAGES = ['javascript', 'typescript'];

function createMockRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/ai/coding-interview/generate-problem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * Helper to create a mock AI client that returns the given text as a single chunk.
 */
function mockAIResponse(responseText: string) {
  const mockClient = {
    isAvailable: vi.fn().mockResolvedValue(true),
    generate: vi.fn().mockImplementation(async function* () {
      yield responseText;
    }),
  };
  (createAIClient as ReturnType<typeof vi.fn>).mockReturnValue(mockClient);
  return mockClient;
}

/**
 * Helper to build a minimal valid GeneratedProblem object (enhanced schema with structured fields).
 */
function buildValidProblem(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    title: 'Two Sum',
    difficulty: 'easy',
    category: 'Arrays',
    tags: ['arrays', 'hash-map'],
    statement: 'Given an array of integers...',
    constraints: ['1 <= nums.length <= 10^4'],
    inputFormat: 'An array of integers and a target',
    outputFormat: 'Indices of two numbers',
    samples: [
      { input: '[2,7,11,15], 9', output: '[0,1]', explanation: '2 + 7 = 9' },
      { input: '[3,2,4], 6', output: '[1,2]', explanation: '2 + 4 = 6' },
    ],
    edgeCases: [
      { description: 'Two elements', input: '[1,2], 3', expectedOutput: '[0,1]' },
      { description: 'Negative numbers', input: '[-1,1], 0', expectedOutput: '[0,1]' },
    ],
    hiddenTestCases: [
      { input: '[1,2,3], 5', expectedOutput: '[1,2]' },
      { input: '[4,5,6], 11', expectedOutput: '[1,2]' },
      { input: '[10,20,30], 50', expectedOutput: '[1,2]' },
      { input: '[1,1], 2', expectedOutput: '[0,1]' },
      { input: '[0,4,3,0], 0', expectedOutput: '[0,3]' },
    ],
    expectedTimeComplexity: 'O(n)',
    expectedSpaceComplexity: 'O(n)',
    companyTags: ['Google', 'Amazon'],
    starterCode: 'function twoSum(nums, target) { // TODO }',
    validator: 'deepEqual',
    providedCode: {
      language: 'javascript',
      imports: [],
      types: [],
      helpers: [],
      testHarness: '',
    },
    functionSignature: {
      name: 'twoSum',
      parameters: [{ name: 'nums', type: 'number[]' }, { name: 'target', type: 'number' }],
      returnType: 'number[]',
    },
    dataStructures: [],
    parser: {
      inputType: 'array',
      helper: '',
    },
    execution: {
      entry: 'twoSum',
      language: 'javascript',
      timeout: 5000,
      memory: 256,
    },
    interview: {
      expectedPatterns: ['hash-map'],
      followUpTopics: ['time-space tradeoff'],
      commonMistakes: ['using nested loops'],
      optimizationQuestions: ['Can you do better than O(n^2)?'],
    },
    hints: [
      { level: 1, content: 'Think about using a hash map' },
    ],
    ...overrides,
  };
}

describe('Preservation Property Tests — Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ─── Property: Invalid Source → 400 ──────────────────────── */
  describe('Property: for all invalid source values, response is 400 with correct error message', () => {
    it('missing source returns 400 with "Missing required field: source"', async () => {
      const req = createMockRequest({});
      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Missing required field: source');
    });

    it('any string not in valid sources returns 400 with "Invalid source: {value}"', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }).filter((s) => !VALID_SOURCES.includes(s)),
          async (invalidSource) => {
            const req = createMockRequest({ source: invalidSource });
            const res = await POST(req);
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error).toBe(`Invalid source: ${invalidSource}`);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /* ─── Property: Invalid Difficulty → 400 ──────────────────── */
  describe('Property: for all invalid difficulty values, response is 400 with correct error message', () => {
    it('any string not in valid difficulties returns 400 with "Invalid difficulty: {value}"', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }).filter((s) => !VALID_DIFFICULTIES.includes(s)),
          async (invalidDifficulty) => {
            const req = createMockRequest({
              source: 'self-test',
              difficulty: invalidDifficulty,
            });
            const res = await POST(req);
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error).toBe(`Invalid difficulty: ${invalidDifficulty}`);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /* ─── Property: Invalid Language → 400 ────────────────────── */
  describe('Property: for all invalid language values, response is 400 with correct error message', () => {
    it('any string not in valid languages returns 400 with "Invalid language: {value}"', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }).filter((s) => !VALID_LANGUAGES.includes(s)),
          async (invalidLanguage) => {
            const req = createMockRequest({
              source: 'self-test',
              language: invalidLanguage,
            });
            const res = await POST(req);
            expect(res.status).toBe(400);
            const json = await res.json();
            expect(json.error).toBe(`Invalid language: ${invalidLanguage}`);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /* ─── Property: Malformed AI JSON → 502 ───────────────────── */
  describe('Property: for all malformed AI JSON responses, response is 502 with correct error message', () => {
    it('unparseable text from AI produces 502 "Failed to parse AI response as valid JSON"', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }).filter((s) => {
            // Filter to strings that cannot be parsed as JSON even after trimming
            const trimmed = s.trim();
            if (trimmed.length === 0) return false; // empty after trim — edge case, skip
            try {
              JSON.parse(trimmed);
              return false;
            } catch {
              return true;
            }
          }),
          async (malformedText) => {
            mockAIResponse(malformedText);
            const req = createMockRequest({ source: 'self-test' });
            const res = await POST(req);
            expect(res.status).toBe(502);
            const json = await res.json();
            expect(json.error).toBe('Failed to parse AI response as valid JSON');
          }
        ),
        { numRuns: 30 }
      );
    });

    it('valid JSON missing required fields produces 502 "AI response does not match required problem structure"', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            fc.record({ foo: fc.string() }),
            fc.record({ title: fc.string() }), // has title but missing everything else
            fc.record({ difficulty: fc.constantFrom('easy', 'medium', 'hard') }),
            fc.constant({}),
            fc.constant({ tags: [] }), // empty tags array
            fc.constant({ title: 'x', difficulty: 'easy', category: 'x' }) // partial fields
          ),
          async (invalidStructure) => {
            mockAIResponse(JSON.stringify(invalidStructure));
            const req = createMockRequest({ source: 'self-test' });
            const res = await POST(req);
            expect(res.status).toBe(502);
            const json = await res.json();
            expect(json.error).toBe('AI response does not match required problem structure');
          }
        ),
        { numRuns: 30 }
      );
    });
  });
});

describe('Preservation Property Tests — validateGeneratedProblem Unit Tests', () => {
  /* ─── Rejects responses missing existing required fields ──── */
  describe('rejects responses missing existing fields', () => {
    const requiredStringFields = [
      'title', 'difficulty', 'category', 'statement',
      'inputFormat', 'outputFormat', 'expectedTimeComplexity',
      'expectedSpaceComplexity', 'starterCode', 'validator',
    ];

    for (const field of requiredStringFields) {
      it(`rejects when "${field}" is missing`, () => {
        const problem = buildValidProblem();
        delete problem[field];
        expect(validateGeneratedProblem(problem)).toBe(false);
      });

      it(`rejects when "${field}" is empty string`, () => {
        const problem = buildValidProblem({ [field]: '' });
        expect(validateGeneratedProblem(problem)).toBe(false);
      });

      it(`rejects when "${field}" is not a string`, () => {
        const problem = buildValidProblem({ [field]: 123 });
        expect(validateGeneratedProblem(problem)).toBe(false);
      });
    }

    it('rejects when tags is missing', () => {
      const problem = buildValidProblem();
      delete problem.tags;
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects when samples is missing', () => {
      const problem = buildValidProblem();
      delete problem.samples;
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects when edgeCases is missing', () => {
      const problem = buildValidProblem();
      delete problem.edgeCases;
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects when hiddenTestCases is missing', () => {
      const problem = buildValidProblem();
      delete problem.hiddenTestCases;
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects when companyTags is missing', () => {
      const problem = buildValidProblem();
      delete problem.companyTags;
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects when constraints is missing', () => {
      const problem = buildValidProblem();
      delete problem.constraints;
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects when difficulty is not easy/medium/hard', () => {
      const problem = buildValidProblem({ difficulty: 'extreme' });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects null input', () => {
      expect(validateGeneratedProblem(null)).toBe(false);
    });

    it('rejects undefined input', () => {
      expect(validateGeneratedProblem(undefined)).toBe(false);
    });

    it('rejects non-object input', () => {
      expect(validateGeneratedProblem('string')).toBe(false);
      expect(validateGeneratedProblem(42)).toBe(false);
    });
  });

  /* ─── Enforces minimum counts ─────────────────────────────── */
  describe('enforces minimum counts', () => {
    it('rejects tags with fewer than 2 items', () => {
      const problem = buildValidProblem({ tags: ['one'] });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects empty tags array', () => {
      const problem = buildValidProblem({ tags: [] });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects samples with fewer than 2 items', () => {
      const problem = buildValidProblem({
        samples: [{ input: 'a', output: 'b', explanation: 'c' }],
      });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects empty samples array', () => {
      const problem = buildValidProblem({ samples: [] });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects edgeCases with fewer than 2 items', () => {
      const problem = buildValidProblem({
        edgeCases: [{ description: 'd', input: 'i', expectedOutput: 'o' }],
      });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects empty edgeCases array', () => {
      const problem = buildValidProblem({ edgeCases: [] });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects hiddenTestCases with fewer than 5 items', () => {
      const problem = buildValidProblem({
        hiddenTestCases: [
          { input: '1', expectedOutput: '1' },
          { input: '2', expectedOutput: '2' },
          { input: '3', expectedOutput: '3' },
          { input: '4', expectedOutput: '4' },
        ],
      });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects empty hiddenTestCases array', () => {
      const problem = buildValidProblem({ hiddenTestCases: [] });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects companyTags with 0 items', () => {
      const problem = buildValidProblem({ companyTags: [] });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects companyTags with more than 5 items', () => {
      const problem = buildValidProblem({
        companyTags: ['A', 'B', 'C', 'D', 'E', 'F'],
      });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('accepts companyTags with exactly 1 item', () => {
      const problem = buildValidProblem({ companyTags: ['Google'] });
      expect(validateGeneratedProblem(problem)).toBe(true);
    });

    it('accepts companyTags with exactly 5 items', () => {
      const problem = buildValidProblem({
        companyTags: ['A', 'B', 'C', 'D', 'E'],
      });
      expect(validateGeneratedProblem(problem)).toBe(true);
    });

    it('accepts a fully valid problem', () => {
      const problem = buildValidProblem();
      expect(validateGeneratedProblem(problem)).toBe(true);
    });
  });

  /* ─── Validates sample structure ──────────────────────────── */
  describe('validates sample structure', () => {
    it('rejects sample missing input', () => {
      const problem = buildValidProblem({
        samples: [
          { output: 'b', explanation: 'c' },
          { input: 'a', output: 'b', explanation: 'c' },
        ],
      });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects sample missing output', () => {
      const problem = buildValidProblem({
        samples: [
          { input: 'a', explanation: 'c' },
          { input: 'a', output: 'b', explanation: 'c' },
        ],
      });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects sample missing explanation', () => {
      const problem = buildValidProblem({
        samples: [
          { input: 'a', output: 'b' },
          { input: 'a', output: 'b', explanation: 'c' },
        ],
      });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });
  });

  /* ─── Validates edge case structure ───────────────────────── */
  describe('validates edge case structure', () => {
    it('rejects edge case missing description', () => {
      const problem = buildValidProblem({
        edgeCases: [
          { input: 'i', expectedOutput: 'o' },
          { description: 'd', input: 'i', expectedOutput: 'o' },
        ],
      });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects edge case missing input', () => {
      const problem = buildValidProblem({
        edgeCases: [
          { description: 'd', expectedOutput: 'o' },
          { description: 'd', input: 'i', expectedOutput: 'o' },
        ],
      });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects edge case missing expectedOutput', () => {
      const problem = buildValidProblem({
        edgeCases: [
          { description: 'd', input: 'i' },
          { description: 'd', input: 'i', expectedOutput: 'o' },
        ],
      });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });
  });

  /* ─── Validates hidden test case structure ─────────────────── */
  describe('validates hidden test case structure', () => {
    it('rejects hidden test case missing input', () => {
      const problem = buildValidProblem({
        hiddenTestCases: [
          { expectedOutput: '1' },
          { input: '2', expectedOutput: '2' },
          { input: '3', expectedOutput: '3' },
          { input: '4', expectedOutput: '4' },
          { input: '5', expectedOutput: '5' },
        ],
      });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });

    it('rejects hidden test case missing expectedOutput', () => {
      const problem = buildValidProblem({
        hiddenTestCases: [
          { input: '1' },
          { input: '2', expectedOutput: '2' },
          { input: '3', expectedOutput: '3' },
          { input: '4', expectedOutput: '4' },
          { input: '5', expectedOutput: '5' },
        ],
      });
      expect(validateGeneratedProblem(problem)).toBe(false);
    });
  });
});
