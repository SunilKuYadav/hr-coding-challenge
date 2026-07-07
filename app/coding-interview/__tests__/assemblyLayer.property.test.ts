import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { assembleProblem, type AICoreOutput } from '../services/assemblyLayer';

/**
 * Property-based tests for category mapping in the assembly layer.
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.5, 7.1, 7.2, 7.3, 7.4**
 */

// ── Arbitraries ────────────────────────────────────────────────────────────

/** Valid JS identifier: starts with letter/_ /$, followed by alphanums/_ /$ */
const arbJsIdentifier: fc.Arbitrary<string> = fc
  .stringMatching(/^[a-zA-Z_$][a-zA-Z0-9_$]{0,19}$/)
  .filter((s) => s.length >= 1);

const arbNonEmptyString: fc.Arbitrary<string> = fc.string({ minLength: 1, maxLength: 80 });

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

const arbSampleIO = fc.record({
  input: fc.string(),
  output: fc.string(),
  explanation: fc.string(),
});

const arbEdgeCase = fc.record({
  description: fc.string(),
  input: fc.string(),
  expectedOutput: fc.string(),
});

const arbTestCase = fc.record({
  input: fc.oneof(fc.string(), fc.integer(), fc.boolean()),
  expectedOutput: fc.oneof(fc.string(), fc.integer(), fc.boolean()),
});

const arbDifficulty = fc.constantFrom('easy', 'medium', 'hard') as fc.Arbitrary<
  'easy' | 'medium' | 'hard'
>;

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

const arbInterviewMetadata = fc.record({
  expectedPatterns: fc.array(arbNonEmptyString, { minLength: 1, maxLength: 4 }),
  followUpTopics: fc.array(arbNonEmptyString, { minLength: 1, maxLength: 4 }),
  commonMistakes: fc.array(arbNonEmptyString, { minLength: 1, maxLength: 4 }),
  optimizationQuestions: fc.array(arbNonEmptyString, { minLength: 1, maxLength: 4 }),
});

/** The set of known categories that trigger specific parser/validator/helper mappings */
const KNOWN_CATEGORIES = ['Trees', 'Binary Trees', 'Linked Lists', 'Graphs', 'Matrices'] as const;
type KnownCategory = (typeof KNOWN_CATEGORIES)[number];

/** Generate a known category directly via the category field (not tags) */
const arbKnownCategory = fc.constantFrom(...KNOWN_CATEGORIES);

/**
 * An unknown category: not in the known set AND does not contain any known
 * category name as a substring (to avoid tag-based fallback triggering).
 */
const arbUnknownCategory: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 30 })
  .filter((s) =>
    KNOWN_CATEGORIES.every(
      (cat) =>
        !s.toLowerCase().includes(cat.toLowerCase()) &&
        !['Trees', 'Binary Trees', 'Linked Lists', 'Graphs', 'Matrices'].includes(s),
    ),
  );

/**
 * Build a complete AICoreOutput for a given category string.
 * Tags are set to non-matching strings to ensure only the category field drives
 * the resolution (no tag-based fallback interference).
 */
function arbCoreForCategory(category: fc.Arbitrary<string>): fc.Arbitrary<AICoreOutput> {
  return category.chain((cat) =>
    fc
      .record({
        title: arbNonEmptyString,
        difficulty: arbDifficulty,
        // Tags deliberately don't match any known category to isolate the category-field path
        tags: fc.array(
          fc.string({ minLength: 1, maxLength: 10 }).filter((t) =>
            KNOWN_CATEGORIES.every(
              (kc) => !t.toLowerCase().includes(kc.toLowerCase()),
            ),
          ),
          { minLength: 2, maxLength: 5 },
        ),
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
      })
      .map(
        (rest): AICoreOutput => ({
          ...rest,
          category: cat,
        }),
      ),
  );
}

// ── Expected mappings ──────────────────────────────────────────────────────

const EXPECTED_MAPPING: Record<
  KnownCategory,
  { parserInputType: string; validatorStrategy: string }
> = {
  Trees:          { parserInputType: 'binary-tree', validatorStrategy: 'treeEqual' },
  'Binary Trees': { parserInputType: 'binary-tree', validatorStrategy: 'treeEqual' },
  'Linked Lists': { parserInputType: 'linked-list', validatorStrategy: 'linkedListEqual' },
  Graphs:         { parserInputType: 'graph',        validatorStrategy: 'deepEqual' },
  Matrices:       { parserInputType: 'matrix',       validatorStrategy: 'deepEqual' },
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Assembly Layer — Property 2: Assembly layer produces correct category mapping', () => {
  // ── 2a. Known categories → correct parser.inputType and validator.strategy ──

  describe('Known categories produce correct parser.inputType and validator.strategy', () => {
    for (const cat of KNOWN_CATEGORIES) {
      const expected = EXPECTED_MAPPING[cat];

      it(`category "${cat}" → parser.inputType="${expected.parserInputType}", validator.strategy="${expected.validatorStrategy}"`, () => {
        fc.assert(
          fc.property(arbCoreForCategory(fc.constant(cat)), (core) => {
            const problem = assembleProblem(core, 'javascript');
            expect(problem.parser.inputType).toBe(expected.parserInputType);
            expect(problem.validator.strategy).toBe(expected.validatorStrategy);
          }),
          { numRuns: 50 },
        );
      });
    }
  });

  // ── 2b. Unknown categories → default 'array' / 'deepEqual' ──────────────

  describe('Unknown categories default to array/deepEqual', () => {
    it('parser.inputType defaults to "array" for unknown category', () => {
      fc.assert(
        fc.property(arbCoreForCategory(arbUnknownCategory), (core) => {
          const problem = assembleProblem(core, 'javascript');
          expect(problem.parser.inputType).toBe('array');
        }),
        { numRuns: 100 },
      );
    });

    it('validator.strategy defaults to "deepEqual" for unknown category', () => {
      fc.assert(
        fc.property(arbCoreForCategory(arbUnknownCategory), (core) => {
          const problem = assembleProblem(core, 'javascript');
          expect(problem.validator.strategy).toBe('deepEqual');
        }),
        { numRuns: 100 },
      );
    });

    it('helperFunctions is empty string for unknown category', () => {
      fc.assert(
        fc.property(arbCoreForCategory(arbUnknownCategory), (core) => {
          const problem = assembleProblem(core, 'javascript');
          expect(problem.helperFunctions).toBe('');
        }),
        { numRuns: 100 },
      );
    });
  });

  // ── 2c. helperFunctions contains expected definitions for known categories ─

  describe('Trees / Binary Trees: helperFunctions contains TreeNode', () => {
    it('category "Trees" → helperFunctions contains "TreeNode"', () => {
      fc.assert(
        fc.property(arbCoreForCategory(fc.constant('Trees')), (core) => {
          const problem = assembleProblem(core, 'javascript');
          expect(problem.helperFunctions).toContain('TreeNode');
        }),
        { numRuns: 50 },
      );
    });

    it('category "Binary Trees" → helperFunctions contains "TreeNode"', () => {
      fc.assert(
        fc.property(arbCoreForCategory(fc.constant('Binary Trees')), (core) => {
          const problem = assembleProblem(core, 'javascript');
          expect(problem.helperFunctions).toContain('TreeNode');
        }),
        { numRuns: 50 },
      );
    });
  });

  describe('Linked Lists: helperFunctions contains ListNode', () => {
    it('category "Linked Lists" → helperFunctions contains "ListNode"', () => {
      fc.assert(
        fc.property(arbCoreForCategory(fc.constant('Linked Lists')), (core) => {
          const problem = assembleProblem(core, 'javascript');
          expect(problem.helperFunctions).toContain('ListNode');
        }),
        { numRuns: 50 },
      );
    });
  });

  describe('Graphs: helperFunctions contains adjacency-related code', () => {
    it('category "Graphs" → helperFunctions contains "buildAdjacencyList"', () => {
      fc.assert(
        fc.property(arbCoreForCategory(fc.constant('Graphs')), (core) => {
          const problem = assembleProblem(core, 'javascript');
          expect(problem.helperFunctions).toContain('buildAdjacencyList');
        }),
        { numRuns: 50 },
      );
    });
  });

  describe('Matrices: helperFunctions contains matrix-related code', () => {
    it('category "Matrices" → helperFunctions contains "matrix" (case-insensitive)', () => {
      fc.assert(
        fc.property(arbCoreForCategory(fc.constant('Matrices')), (core) => {
          const problem = assembleProblem(core, 'javascript');
          expect(problem.helperFunctions.toLowerCase()).toContain('matrix');
        }),
        { numRuns: 50 },
      );
    });
  });

  // ── 2d. All known categories produce non-empty helperFunctions ────────────

  describe('All known categories produce non-empty helperFunctions', () => {
    it('helperFunctions is non-empty for every known category', () => {
      fc.assert(
        fc.property(arbCoreForCategory(arbKnownCategory), (core) => {
          const problem = assembleProblem(core, 'javascript');
          expect(problem.helperFunctions.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 },
      );
    });
  });

  // ── 2e. Mapping is consistent across javascript and typescript languages ──

  describe('Category mapping is language-independent', () => {
    it('parser.inputType and validator.strategy are identical for js and ts', () => {
      fc.assert(
        fc.property(arbCoreForCategory(arbKnownCategory), (core) => {
          const js = assembleProblem(core, 'javascript');
          const ts = assembleProblem(core, 'typescript');
          expect(js.parser.inputType).toBe(ts.parser.inputType);
          expect(js.validator.strategy).toBe(ts.validator.strategy);
        }),
        { numRuns: 100 },
      );
    });
  });
});
