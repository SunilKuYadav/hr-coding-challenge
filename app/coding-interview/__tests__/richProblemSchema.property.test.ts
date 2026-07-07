import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { RichProblemSchema } from '../lib/schemas/richProblemSchema';
import { z } from 'zod';

/**
 * Property-based tests for RichProblem schema validation.
 *
 * **Validates: Requirements 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 6.1, 6.2, 8.1, 8.2, 9.1, 9.2, 9.3, 9.4**
 */
describe('RichProblemSchema — property-based tests', () => {
  /* ─── Arbitraries for Valid Data ─────────────────────── */

  // Valid JavaScript identifier
  const arbJsIdentifier = fc.string({ minLength: 1, maxLength: 10 })
    .filter(s => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s));

  const arbDifficulty = fc.constantFrom('easy' as const, 'medium' as const, 'hard' as const);

  const arbLanguage = fc.constantFrom('javascript' as const, 'typescript' as const);

  const arbParserInputType = fc.constantFrom(
    'binary-tree' as const,
    'linked-list' as const,
    'matrix' as const,
    'graph' as const,
    'array' as const,
    'string' as const
  );

  const arbValidatorStrategy = fc.constantFrom(
    'deepEqual' as const,
    'linkedListEqual' as const,
    'treeEqual' as const,
    'unorderedArrayEqual' as const,
    'floatEqual' as const
  );

  const arbFunctionParameter = fc.record({
    name: arbJsIdentifier,
    type: fc.string({ minLength: 1, maxLength: 20 }),
  });

  const arbFunctionSignature = fc.record({
    name: arbJsIdentifier,
    parameters: fc.array(arbFunctionParameter, { minLength: 1, maxLength: 5 }),
    returnType: fc.string({ minLength: 1, maxLength: 20 }),
  });

  const arbParser = fc.record({
    inputType: arbParserInputType,
  });

  const arbValidator = fc.record({
    strategy: arbValidatorStrategy,
  });

  const arbExecutionConfig = fc.record({
    entryFunction: arbJsIdentifier,
    language: arbLanguage,
    timeoutMs: fc.integer({ min: 1, max: 60000 }),
    memoryLimitMb: fc.integer({ min: 1, max: 2048 }),
  });

  const arbHint = fc.record({
    level: fc.integer({ min: 1, max: 4 }),
    content: fc.string({ minLength: 1, maxLength: 100 }),
  });

  const arbInterviewMetadata = fc.record({
    expectedPatterns: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
    followUpTopics: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
    commonMistakes: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
    optimizationQuestions: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
  });

  const arbSampleIO = fc.record({
    input: fc.string({ minLength: 1, maxLength: 100 }),
    output: fc.string({ minLength: 1, maxLength: 100 }),
    explanation: fc.string({ minLength: 1, maxLength: 100 }),
  });

  const arbEdgeCase = fc.record({
    description: fc.string({ minLength: 1, maxLength: 100 }),
    input: fc.string({ minLength: 1, maxLength: 100 }),
    expectedOutput: fc.string({ minLength: 1, maxLength: 100 }),
  });

  const arbTestCase = fc.record({
    input: fc.oneof(
      fc.string(),
      fc.integer(),
      fc.array(fc.integer()),
      fc.constant(null)
    ),
    expectedOutput: fc.oneof(
      fc.string(),
      fc.integer(),
      fc.array(fc.integer()),
      fc.constant(null)
    ),
  });

  // Complete valid RichProblem object
  const arbValidRichProblem = fc.record({
    title: fc.string({ minLength: 1, maxLength: 100 }),
    difficulty: arbDifficulty,
    category: fc.string({ minLength: 1, maxLength: 50 }),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 2, maxLength: 10 }),
    statement: fc.string({ minLength: 1, maxLength: 500 }),
    constraints: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 0, maxLength: 10 }),
    inputFormat: fc.string({ minLength: 1, maxLength: 200 }),
    outputFormat: fc.string({ minLength: 1, maxLength: 200 }),
    samples: fc.array(arbSampleIO, { minLength: 2, maxLength: 5 }),
    edgeCases: fc.array(arbEdgeCase, { minLength: 2, maxLength: 5 }),
    hiddenTestCases: fc.array(arbTestCase, { minLength: 5, maxLength: 10 }),
    expectedTimeComplexity: fc.string({ minLength: 1, maxLength: 50 }),
    expectedSpaceComplexity: fc.string({ minLength: 1, maxLength: 50 }),
    companyTags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 5 }),
    boilerplate: fc.string({ minLength: 1, maxLength: 500 }),
    starterCode: fc.string({ minLength: 1, maxLength: 500 }),
    providedCode: fc.string({ minLength: 0, maxLength: 500 }),
    helperFunctions: fc.string({ minLength: 0, maxLength: 500 }),
    functionSignature: arbFunctionSignature,
    parser: arbParser,
    validator: arbValidator,
    executionConfig: arbExecutionConfig,
    hints: fc.array(arbHint, { minLength: 1, maxLength: 4 }),
    interviewMetadata: arbInterviewMetadata,
  });

  /* ─── Property 1: Schema validates well-formed data ──── */
  describe('Property 1: Schema validation', () => {
    it('accepts valid RichProblem objects', () => {
      fc.assert(
        fc.property(arbValidRichProblem, (problem) => {
          const result = RichProblemSchema.safeParse(problem);
          if (!result.success) {
            console.error('Validation failed:', result.error.issues);
          }
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    /* ─── Single-field violation tests ──────────────────── */

    it('rejects missing required field: title', () => {
      fc.assert(
        fc.property(arbValidRichProblem, (problem) => {
          const { title, ...rest } = problem;
          const result = RichProblemSchema.safeParse(rest);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects invalid difficulty enum', () => {
      fc.assert(
        fc.property(arbValidRichProblem, fc.string(), (problem, invalidDifficulty) => {
          fc.pre(!['easy', 'medium', 'hard'].includes(invalidDifficulty));
          const invalid = { ...problem, difficulty: invalidDifficulty };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects tags array with length < 2', () => {
      fc.assert(
        fc.property(arbValidRichProblem, (problem) => {
          const invalid = { ...problem, tags: ['single-tag'] };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects empty tags array', () => {
      fc.assert(
        fc.property(arbValidRichProblem, (problem) => {
          const invalid = { ...problem, tags: [] };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects samples array with length < 2', () => {
      fc.assert(
        fc.property(arbValidRichProblem, (problem) => {
          const invalid = { ...problem, samples: [problem.samples[0]] };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects edgeCases array with length < 2', () => {
      fc.assert(
        fc.property(arbValidRichProblem, (problem) => {
          const invalid = { ...problem, edgeCases: [problem.edgeCases[0]] };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects hiddenTestCases array with length < 5', () => {
      fc.assert(
        fc.property(arbValidRichProblem, (problem) => {
          const invalid = { ...problem, hiddenTestCases: problem.hiddenTestCases.slice(0, 4) };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects companyTags with length < 1', () => {
      fc.assert(
        fc.property(arbValidRichProblem, (problem) => {
          const invalid = { ...problem, companyTags: [] };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects companyTags with length > 5', () => {
      fc.assert(
        fc.property(arbValidRichProblem, (problem) => {
          const invalid = { ...problem, companyTags: ['A', 'B', 'C', 'D', 'E', 'F'] };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects invalid functionSignature.name (not a JS identifier)', () => {
      fc.assert(
        fc.property(arbValidRichProblem, (problem) => {
          const invalid = {
            ...problem,
            functionSignature: { ...problem.functionSignature, name: '123invalid' }
          };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects functionSignature.parameters with length < 1', () => {
      fc.assert(
        fc.property(arbValidRichProblem, (problem) => {
          const invalid = {
            ...problem,
            functionSignature: { ...problem.functionSignature, parameters: [] }
          };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects invalid parser.inputType enum', () => {
      fc.assert(
        fc.property(arbValidRichProblem, fc.string(), (problem, invalidInput) => {
          fc.pre(!['binary-tree', 'linked-list', 'matrix', 'graph', 'array', 'string'].includes(invalidInput));
          const invalid = { ...problem, parser: { inputType: invalidInput as any } };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects invalid validator.strategy enum', () => {
      fc.assert(
        fc.property(arbValidRichProblem, fc.string(), (problem, invalidStrategy) => {
          fc.pre(!['deepEqual', 'linkedListEqual', 'treeEqual', 'unorderedArrayEqual', 'floatEqual'].includes(invalidStrategy));
          const invalid = { ...problem, validator: { strategy: invalidStrategy as any } };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects non-positive executionConfig.timeoutMs', () => {
      fc.assert(
        fc.property(arbValidRichProblem, fc.integer({ min: -1000, max: 0 }), (problem, invalidTimeout) => {
          const invalid = {
            ...problem,
            executionConfig: { ...problem.executionConfig, timeoutMs: invalidTimeout }
          };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects non-positive executionConfig.memoryLimitMb', () => {
      fc.assert(
        fc.property(arbValidRichProblem, fc.integer({ min: -1000, max: 0 }), (problem, invalidMemory) => {
          const invalid = {
            ...problem,
            executionConfig: { ...problem.executionConfig, memoryLimitMb: invalidMemory }
          };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects invalid executionConfig.language enum', () => {
      fc.assert(
        fc.property(arbValidRichProblem, fc.string(), (problem, invalidLang) => {
          fc.pre(!['javascript', 'typescript'].includes(invalidLang));
          const invalid = {
            ...problem,
            executionConfig: { ...problem.executionConfig, language: invalidLang as any }
          };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects hints array with length < 1', () => {
      fc.assert(
        fc.property(arbValidRichProblem, (problem) => {
          const invalid = { ...problem, hints: [] };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects hints array with length > 4', () => {
      fc.assert(
        fc.property(arbValidRichProblem, (problem) => {
          const invalid = {
            ...problem,
            hints: [
              { level: 1, content: 'hint1' },
              { level: 2, content: 'hint2' },
              { level: 3, content: 'hint3' },
              { level: 4, content: 'hint4' },
              { level: 1, content: 'hint5' },
            ]
          };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects hint.level < 1', () => {
      fc.assert(
        fc.property(arbValidRichProblem, fc.integer({ min: -100, max: 0 }), (problem, invalidLevel) => {
          const invalid = {
            ...problem,
            hints: [{ level: invalidLevel, content: 'test' }]
          };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects hint.level > 4', () => {
      fc.assert(
        fc.property(arbValidRichProblem, fc.integer({ min: 5, max: 100 }), (problem, invalidLevel) => {
          const invalid = {
            ...problem,
            hints: [{ level: invalidLevel, content: 'test' }]
          };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects interviewMetadata.expectedPatterns with length < 1', () => {
      fc.assert(
        fc.property(arbValidRichProblem, (problem) => {
          const invalid = {
            ...problem,
            interviewMetadata: { ...problem.interviewMetadata, expectedPatterns: [] }
          };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects interviewMetadata.followUpTopics with length < 1', () => {
      fc.assert(
        fc.property(arbValidRichProblem, (problem) => {
          const invalid = {
            ...problem,
            interviewMetadata: { ...problem.interviewMetadata, followUpTopics: [] }
          };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects interviewMetadata.commonMistakes with length < 1', () => {
      fc.assert(
        fc.property(arbValidRichProblem, (problem) => {
          const invalid = {
            ...problem,
            interviewMetadata: { ...problem.interviewMetadata, commonMistakes: [] }
          };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });

    it('rejects interviewMetadata.optimizationQuestions with length < 1', () => {
      fc.assert(
        fc.property(arbValidRichProblem, (problem) => {
          const invalid = {
            ...problem,
            interviewMetadata: { ...problem.interviewMetadata, optimizationQuestions: [] }
          };
          const result = RichProblemSchema.safeParse(invalid);
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error).toBeInstanceOf(z.ZodError);
          }
        }),
        { numRuns: 20 }
      );
    });
  });
});
