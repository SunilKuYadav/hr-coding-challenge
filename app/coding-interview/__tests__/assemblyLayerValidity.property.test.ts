import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ZodError } from 'zod';
import { assembleProblem, type AICoreOutput } from '../services/assemblyLayer';

/**
 * Property-based tests for the assembly layer output validity.
 *
 * **Validates: Requirements 3.4, 5.1**
 */

// ── Arbitraries ────────────────────────────────────────────────────────────

/** Valid JS identifier: starts with letter/_ /$, followed by alphanums/_ /$ */
const arbJsIdentifier: fc.Arbitrary<string> = fc
  .stringMatching(/^[a-zA-Z_$][a-zA-Z0-9_$]{0,19}$/)
  .filter((s) => s.length >= 1);

/** Non-empty string */
const arbNonEmptyString: fc.Arbitrary<string> = fc.string({ minLength: 1, maxLength: 80 });

/** A valid functionSignature for AICoreOutput */
const arbFunctionSignature = fc.record({
  name: arbJsIdentifier,
  parameters: fc.array(
    fc.record({
      name: arbJsIdentifier,
      type: arbNonEmptyString,
    }),
    { minLength: 1, maxLength: 4 },
  ),
  returnType: arbNonEmptyString,
});

/** A single sample IO object */
const arbSampleIO = fc.record({
  input: fc.string(),
  output: fc.string(),
  explanation: fc.string(),
});

/** A single edge case object */
const arbEdgeCase = fc.record({
  description: fc.string(),
  input: fc.string(),
  expectedOutput: fc.string(),
});

/** A single hidden test case (input/expectedOutput are unknown, use primitives) */
const arbTestCase = fc.record({
  input: fc.oneof(fc.string(), fc.integer(), fc.boolean()),
  expectedOutput: fc.oneof(fc.string(), fc.integer(), fc.boolean()),
});

/**
 * A valid difficulty value.
 */
const arbDifficulty = fc.constantFrom('easy', 'medium', 'hard') as fc.Arbitrary<
  'easy' | 'medium' | 'hard'
>;

/**
 * Hints: 1–4 items, each with a unique level drawn from 1–4.
 * We generate a shuffled subset of [1,2,3,4] of length 1–4 to avoid
 * duplicate levels (though the schema doesn't require uniqueness, it is
 * more realistic and avoids surprises).
 */
const arbHints = fc
  .integer({ min: 1, max: 4 })
  .chain((count) =>
    fc.array(
      fc.record({
        level: fc.integer({ min: 1, max: 4 }),
        content: arbNonEmptyString,
      }),
      { minLength: count, maxLength: count },
    ),
  );

/** Interview metadata: each array needs ≥1 non-empty string */
const arbInterviewMetadata = fc.record({
  expectedPatterns: fc.array(arbNonEmptyString, { minLength: 1, maxLength: 4 }),
  followUpTopics: fc.array(arbNonEmptyString, { minLength: 1, maxLength: 4 }),
  commonMistakes: fc.array(arbNonEmptyString, { minLength: 1, maxLength: 4 }),
  optimizationQuestions: fc.array(arbNonEmptyString, { minLength: 1, maxLength: 4 }),
});

/**
 * A fully valid AICoreOutput arbitrary, honouring all schema constraints
 * that the assembly layer passes through to RichProblemSchema.parse().
 */
const arbAICoreOutput: fc.Arbitrary<AICoreOutput> = fc.record({
  title: arbNonEmptyString,
  difficulty: arbDifficulty,
  category: arbNonEmptyString,
  tags: fc.array(fc.string(), { minLength: 2, maxLength: 6 }),
  statement: arbNonEmptyString,
  constraints: fc.array(fc.string(), { maxLength: 5 }),
  inputFormat: arbNonEmptyString,
  outputFormat: arbNonEmptyString,
  samples: fc.array(arbSampleIO, { minLength: 2, maxLength: 4 }),
  edgeCases: fc.array(arbEdgeCase, { minLength: 2, maxLength: 4 }),
  hiddenTestCases: fc.array(arbTestCase, { minLength: 5, maxLength: 8 }),
  expectedTimeComplexity: arbNonEmptyString,
  expectedSpaceComplexity: arbNonEmptyString,
  companyTags: fc.array(fc.string(), { minLength: 1, maxLength: 5 }),
  functionSignature: arbFunctionSignature,
  hints: arbHints,
  interviewMetadata: arbInterviewMetadata,
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Property 3: Assembly output is always schema-valid', () => {
  describe('with language = javascript', () => {
    it('assembleProblem() does not throw ZodError for any valid AICoreOutput', () => {
      fc.assert(
        fc.property(arbAICoreOutput, (core) => {
          expect(() => assembleProblem(core, 'javascript')).not.toThrow(ZodError);
        }),
        { numRuns: 100 },
      );
    });

    it('assembleProblem() returns a defined RichProblem for any valid AICoreOutput', () => {
      fc.assert(
        fc.property(arbAICoreOutput, (core) => {
          const result = assembleProblem(core, 'javascript');
          expect(result).toBeDefined();
          expect(result.title).toBe(core.title);
          expect(result.difficulty).toBe(core.difficulty);
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('with language = typescript', () => {
    it('assembleProblem() does not throw ZodError for any valid AICoreOutput', () => {
      fc.assert(
        fc.property(arbAICoreOutput, (core) => {
          expect(() => assembleProblem(core, 'typescript')).not.toThrow(ZodError);
        }),
        { numRuns: 100 },
      );
    });

    it('assembleProblem() returns a defined RichProblem for any valid AICoreOutput', () => {
      fc.assert(
        fc.property(arbAICoreOutput, (core) => {
          const result = assembleProblem(core, 'typescript');
          expect(result).toBeDefined();
          expect(result.executionConfig.language).toBe('typescript');
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('no ZodError across both languages', () => {
    it('assembleProblem() succeeds for both javascript and typescript with the same core', () => {
      fc.assert(
        fc.property(
          arbAICoreOutput,
          fc.constantFrom('javascript', 'typescript') as fc.Arbitrary<
            'javascript' | 'typescript'
          >,
          (core, language) => {
            expect(() => assembleProblem(core, language)).not.toThrow(ZodError);
          },
        ),
        { numRuns: 200 },
      );
    });
  });
});
