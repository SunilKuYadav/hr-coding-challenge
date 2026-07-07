import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { assembleProblem, type AICoreOutput } from '../services/assemblyLayer';

/**
 * Property-based tests for boilerplate derivation.
 *
 * **Validates: Requirements 2.5, 10.1, 10.2**
 */
describe('Assembly Layer — Property 4: Boilerplate derivation is deterministic concatenation', () => {
  /* ─── Arbitraries ─────────────────────────────────────── */

  // Valid JavaScript identifier (matches the regex used in subSchemas.ts)
  const arbJsIdentifier = fc
    .string({ minLength: 1, maxLength: 10 })
    .filter((s) => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s));

  const arbDifficulty = fc.constantFrom(
    'easy' as const,
    'medium' as const,
    'hard' as const,
  );

  const arbLanguage = fc.constantFrom(
    'javascript' as const,
    'typescript' as const,
  );

  // Known categories that trigger category-specific helpers
  const arbKnownCategory = fc.constantFrom(
    'Trees',
    'Binary Trees',
    'Linked Lists',
    'Graphs',
    'Matrices',
  );

  // Unknown / generic category (no special helpers)
  const arbUnknownCategory = fc
    .string({ minLength: 1, maxLength: 30 })
    .filter(
      (s) =>
        !['Trees', 'Binary Trees', 'Linked Lists', 'Graphs', 'Matrices'].includes(s),
    );

  const arbCategory = fc.oneof(arbKnownCategory, arbUnknownCategory);

  const arbFunctionParameter = fc.record({
    name: arbJsIdentifier,
    type: fc.string({ minLength: 1, maxLength: 20 }),
  });

  const arbFunctionSignature = fc.record({
    name: arbJsIdentifier,
    parameters: fc.array(arbFunctionParameter, { minLength: 1, maxLength: 5 }),
    returnType: fc.string({ minLength: 1, maxLength: 20 }),
  });

  const arbSampleIO = fc.record({
    input: fc.string({ minLength: 1, maxLength: 50 }),
    output: fc.string({ minLength: 1, maxLength: 50 }),
    explanation: fc.string({ minLength: 1, maxLength: 50 }),
  });

  const arbEdgeCase = fc.record({
    description: fc.string({ minLength: 1, maxLength: 50 }),
    input: fc.string({ minLength: 1, maxLength: 50 }),
    expectedOutput: fc.string({ minLength: 1, maxLength: 50 }),
  });

  const arbTestCase = fc.record({
    input: fc.oneof(fc.string(), fc.integer(), fc.array(fc.integer())),
    expectedOutput: fc.oneof(fc.string(), fc.integer(), fc.array(fc.integer())),
  });

  const arbHint = fc.record({
    level: fc.integer({ min: 1, max: 4 }),
    content: fc.string({ minLength: 1, maxLength: 100 }),
  });

  const arbInterviewMetadata = fc.record({
    expectedPatterns: fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
      minLength: 1,
      maxLength: 5,
    }),
    followUpTopics: fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
      minLength: 1,
      maxLength: 5,
    }),
    commonMistakes: fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
      minLength: 1,
      maxLength: 5,
    }),
    optimizationQuestions: fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
      minLength: 1,
      maxLength: 5,
    }),
  });

  // Complete valid AICoreOutput generator
  const arbAICoreOutput = fc
    .tuple(arbCategory, arbFunctionSignature)
    .chain(([category, functionSignature]) =>
      fc
        .record({
          title: fc.string({ minLength: 1, maxLength: 100 }),
          difficulty: arbDifficulty,
          tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), {
            minLength: 2,
            maxLength: 8,
          }),
          statement: fc.string({ minLength: 1, maxLength: 300 }),
          constraints: fc.array(fc.string({ minLength: 1, maxLength: 100 }), {
            minLength: 0,
            maxLength: 5,
          }),
          inputFormat: fc.string({ minLength: 1, maxLength: 100 }),
          outputFormat: fc.string({ minLength: 1, maxLength: 100 }),
          samples: fc.array(arbSampleIO, { minLength: 2, maxLength: 5 }),
          edgeCases: fc.array(arbEdgeCase, { minLength: 2, maxLength: 5 }),
          hiddenTestCases: fc.array(arbTestCase, { minLength: 5, maxLength: 10 }),
          expectedTimeComplexity: fc.string({ minLength: 1, maxLength: 50 }),
          expectedSpaceComplexity: fc.string({ minLength: 1, maxLength: 50 }),
          companyTags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), {
            minLength: 1,
            maxLength: 5,
          }),
          hints: fc.array(arbHint, { minLength: 1, maxLength: 4 }),
          interviewMetadata: arbInterviewMetadata,
        })
        .map(
          (rest): AICoreOutput => ({
            ...rest,
            category,
            functionSignature,
          }),
        ),
    );

  /* ─── Property 4 ─────────────────────────────────────── */

  describe('Property 4: boilerplate === [providedCode, helperFunctions, starterCode].filter(Boolean).join("\\n\\n")', () => {
    it('holds for javascript language across arbitrary valid AICoreOutput', () => {
      fc.assert(
        fc.property(arbAICoreOutput, (core) => {
          const problem = assembleProblem(core, 'javascript');

          const expected = [
            problem.providedCode,
            problem.helperFunctions,
            problem.starterCode,
          ]
            .filter(Boolean)
            .join('\n\n');

          expect(problem.boilerplate).toBe(expected);
        }),
        { numRuns: 100 },
      );
    });

    it('holds for typescript language across arbitrary valid AICoreOutput', () => {
      fc.assert(
        fc.property(arbAICoreOutput, (core) => {
          const problem = assembleProblem(core, 'typescript');

          const expected = [
            problem.providedCode,
            problem.helperFunctions,
            problem.starterCode,
          ]
            .filter(Boolean)
            .join('\n\n');

          expect(problem.boilerplate).toBe(expected);
        }),
        { numRuns: 100 },
      );
    });

    it('holds for known category (Trees) where helperFunctions is non-empty', () => {
      const arbTreesCore = arbAICoreOutput.filter(
        (core) => core.category === 'Trees',
      );

      fc.assert(
        fc.property(arbTreesCore, (core) => {
          const problem = assembleProblem(core, 'javascript');

          // helperFunctions is non-empty for Trees
          expect(problem.helperFunctions.length).toBeGreaterThan(0);

          const expected = [
            problem.providedCode,
            problem.helperFunctions,
            problem.starterCode,
          ]
            .filter(Boolean)
            .join('\n\n');

          expect(problem.boilerplate).toBe(expected);
        }),
        { numRuns: 50 },
      );
    });

    it('holds for unknown category where helperFunctions is empty string', () => {
      const arbUnknownCore = arbAICoreOutput.filter(
        (core) =>
          !['Trees', 'Binary Trees', 'Linked Lists', 'Graphs', 'Matrices'].includes(
            core.category,
          ),
      );

      fc.assert(
        fc.property(arbUnknownCore, (core) => {
          const problem = assembleProblem(core, 'javascript');

          // helperFunctions is empty for unknown categories
          expect(problem.helperFunctions).toBe('');

          // boilerplate still equals the formula (empty strings filtered out)
          const expected = [
            problem.providedCode,
            problem.helperFunctions,
            problem.starterCode,
          ]
            .filter(Boolean)
            .join('\n\n');

          expect(problem.boilerplate).toBe(expected);
        }),
        { numRuns: 50 },
      );
    });

    it('uses default language (javascript) when no language is provided', () => {
      fc.assert(
        fc.property(arbAICoreOutput, (core) => {
          // assembleProblem defaults to 'javascript'
          const problem = assembleProblem(core);

          const expected = [
            problem.providedCode,
            problem.helperFunctions,
            problem.starterCode,
          ]
            .filter(Boolean)
            .join('\n\n');

          expect(problem.boilerplate).toBe(expected);
        }),
        { numRuns: 50 },
      );
    });
  });
});
