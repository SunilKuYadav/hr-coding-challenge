import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { adaptForWorker } from '../services/executionAdapter';
import type { RichProblem } from '../lib/schemas';

/**
 * Property-based tests for the execution adapter.
 *
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 6.4, 10.4**
 */

// ── Arbitraries ────────────────────────────────────────────────────────────

/** Valid JavaScript identifier */
const arbJsIdentifier: fc.Arbitrary<string> = fc
  .stringMatching(/^[a-zA-Z_$][a-zA-Z0-9_$]{0,19}$/)
  .filter((s) => s.length >= 1);

const arbNonEmptyString: fc.Arbitrary<string> = fc.string({ minLength: 1, maxLength: 80 });

const arbDifficulty = fc.constantFrom(
  'easy' as const,
  'medium' as const,
  'hard' as const,
);

const arbLanguage = fc.constantFrom(
  'javascript' as const,
  'typescript' as const,
);

const arbParserInputType = fc.constantFrom(
  'binary-tree' as const,
  'linked-list' as const,
  'matrix' as const,
  'graph' as const,
  'array' as const,
  'string' as const,
);

/** Non-deepEqual validator strategies */
const arbNonDeepEqualStrategy = fc.constantFrom(
  'linkedListEqual' as const,
  'treeEqual' as const,
  'unorderedArrayEqual' as const,
  'floatEqual' as const,
);

const arbValidatorStrategy = fc.oneof(
  fc.constant('deepEqual' as const),
  arbNonDeepEqualStrategy,
);

const arbFunctionParameter = fc.record({
  name: arbJsIdentifier,
  type: arbNonEmptyString,
});

const arbFunctionSignature = fc.record({
  name: arbJsIdentifier,
  parameters: fc.array(arbFunctionParameter, { minLength: 1, maxLength: 4 }),
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

const arbHint = fc.record({
  level: fc.integer({ min: 1, max: 4 }),
  content: arbNonEmptyString,
});

const arbInterviewMetadata = fc.record({
  expectedPatterns: fc.array(arbNonEmptyString, { minLength: 1, maxLength: 4 }),
  followUpTopics: fc.array(arbNonEmptyString, { minLength: 1, maxLength: 4 }),
  commonMistakes: fc.array(arbNonEmptyString, { minLength: 1, maxLength: 4 }),
  optimizationQuestions: fc.array(arbNonEmptyString, { minLength: 1, maxLength: 4 }),
});

/**
 * Builds a complete valid RichProblem arbitrary.
 * Accepts optional overrides for validator.strategy and executionConfig.entryFunction
 * to allow targeted property testing.
 */
function buildArbRichProblem(options?: {
  strategyArb?: fc.Arbitrary<RichProblem['validator']['strategy']>;
  entryFunctionArb?: fc.Arbitrary<string>;
}): fc.Arbitrary<RichProblem> {
  const strategyArb = options?.strategyArb ?? arbValidatorStrategy;
  const entryFunctionArb = options?.entryFunctionArb ?? arbJsIdentifier;

  return fc.record({
    // Legacy fields
    title: arbNonEmptyString,
    difficulty: arbDifficulty,
    category: arbNonEmptyString,
    tags: fc.array(arbNonEmptyString, { minLength: 2, maxLength: 6 }),
    statement: arbNonEmptyString,
    constraints: fc.array(fc.string(), { minLength: 0, maxLength: 5 }),
    inputFormat: arbNonEmptyString,
    outputFormat: arbNonEmptyString,
    samples: fc.array(arbSampleIO, { minLength: 2, maxLength: 4 }),
    edgeCases: fc.array(arbEdgeCase, { minLength: 2, maxLength: 4 }),
    hiddenTestCases: fc.array(arbTestCase, { minLength: 5, maxLength: 10 }),
    expectedTimeComplexity: arbNonEmptyString,
    expectedSpaceComplexity: arbNonEmptyString,
    companyTags: fc.array(arbNonEmptyString, { minLength: 1, maxLength: 5 }),
    boilerplate: arbNonEmptyString,
    // New rich fields
    starterCode: arbNonEmptyString,
    providedCode: fc.string({ minLength: 0, maxLength: 200 }),
    helperFunctions: fc.string({ minLength: 0, maxLength: 200 }),
    functionSignature: arbFunctionSignature,
    parser: fc.record({ inputType: arbParserInputType }),
    validator: strategyArb.map((strategy) => ({ strategy })),
    executionConfig: entryFunctionArb.chain((entryFunction) =>
      fc.record({
        language: arbLanguage,
        timeoutMs: fc.integer({ min: 1, max: 60000 }),
        memoryLimitMb: fc.integer({ min: 1, max: 2048 }),
      }).map((rest) => ({ entryFunction, ...rest })),
    ),
    hints: fc.array(arbHint, { minLength: 1, maxLength: 4 }),
    interviewMetadata: arbInterviewMetadata,
  });
}

/** A non-empty arbitrary user code string */
const arbUserCode: fc.Arbitrary<string> = fc.string({ minLength: 1, maxLength: 300 });

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Execution Adapter — Property 5: Execution adapter produces correct WorkerRequest', () => {
  // ── 5a. Code ordering: providedCode → helperFunctions → userCode ──────────

  describe('(a) Code ordering: providedCode → helperFunctions → userCode', () => {
    it('code starts with providedCode when providedCode is non-empty', () => {
      const arbProblemWithProvidedCode = buildArbRichProblem().filter(
        (p) => p.providedCode.length > 0,
      );

      fc.assert(
        fc.property(arbProblemWithProvidedCode, arbUserCode, (problem, userCode) => {
          const { workerRequest } = adaptForWorker(problem, userCode);
          expect(workerRequest.code.startsWith(problem.providedCode)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('code contains helperFunctions after providedCode (when both are present)', () => {
      const arbProblemWithBoth = buildArbRichProblem().filter(
        (p) => p.providedCode.length > 0 && p.helperFunctions.length > 0,
      );

      fc.assert(
        fc.property(arbProblemWithBoth, arbUserCode, (problem, userCode) => {
          const { workerRequest } = adaptForWorker(problem, userCode);
          const providedIdx = workerRequest.code.indexOf(problem.providedCode);
          const helperIdx = workerRequest.code.indexOf(problem.helperFunctions);
          expect(providedIdx).toBeGreaterThanOrEqual(0);
          expect(helperIdx).toBeGreaterThan(providedIdx);
        }),
        { numRuns: 100 },
      );
    });

    it('code contains userCode after providedCode and helperFunctions', () => {
      const arbProblemWithAll = buildArbRichProblem().filter(
        (p) => p.providedCode.length > 0 && p.helperFunctions.length > 0,
      );

      fc.assert(
        fc.property(arbProblemWithAll, arbUserCode, (problem, userCode) => {
          const { workerRequest } = adaptForWorker(problem, userCode);
          const helperIdx = workerRequest.code.indexOf(problem.helperFunctions);
          const userIdx = workerRequest.code.indexOf(userCode);
          expect(helperIdx).toBeGreaterThanOrEqual(0);
          expect(userIdx).toBeGreaterThan(helperIdx);
        }),
        { numRuns: 100 },
      );
    });

    it('code always contains userCode', () => {
      fc.assert(
        fc.property(buildArbRichProblem(), arbUserCode, (problem, userCode) => {
          const { workerRequest } = adaptForWorker(problem, userCode);
          expect(workerRequest.code).toContain(userCode);
        }),
        { numRuns: 100 },
      );
    });
  });

  // ── 5b. Non-deepEqual → comparator implementation injected ────────────────

  describe('(b) Non-deepEqual strategy: comparator implementation injected into code', () => {
    it('treeEqual strategy → code contains "function treeEqual"', () => {
      const arbProblem = buildArbRichProblem({
        strategyArb: fc.constant('treeEqual' as const),
      });

      fc.assert(
        fc.property(arbProblem, arbUserCode, (problem, userCode) => {
          const { workerRequest } = adaptForWorker(problem, userCode);
          expect(workerRequest.code).toContain('function treeEqual');
        }),
        { numRuns: 50 },
      );
    });

    it('linkedListEqual strategy → code contains "function linkedListEqual"', () => {
      const arbProblem = buildArbRichProblem({
        strategyArb: fc.constant('linkedListEqual' as const),
      });

      fc.assert(
        fc.property(arbProblem, arbUserCode, (problem, userCode) => {
          const { workerRequest } = adaptForWorker(problem, userCode);
          expect(workerRequest.code).toContain('function linkedListEqual');
        }),
        { numRuns: 50 },
      );
    });

    it('unorderedArrayEqual strategy → code contains "function unorderedArrayEqual"', () => {
      const arbProblem = buildArbRichProblem({
        strategyArb: fc.constant('unorderedArrayEqual' as const),
      });

      fc.assert(
        fc.property(arbProblem, arbUserCode, (problem, userCode) => {
          const { workerRequest } = adaptForWorker(problem, userCode);
          expect(workerRequest.code).toContain('function unorderedArrayEqual');
        }),
        { numRuns: 50 },
      );
    });

    it('floatEqual strategy → code contains "function floatEqual"', () => {
      const arbProblem = buildArbRichProblem({
        strategyArb: fc.constant('floatEqual' as const),
      });

      fc.assert(
        fc.property(arbProblem, arbUserCode, (problem, userCode) => {
          const { workerRequest } = adaptForWorker(problem, userCode);
          expect(workerRequest.code).toContain('function floatEqual');
        }),
        { numRuns: 50 },
      );
    });

    it('any non-deepEqual strategy → code contains the comparator function name', () => {
      const arbProblem = buildArbRichProblem({
        strategyArb: arbNonDeepEqualStrategy,
      });

      fc.assert(
        fc.property(arbProblem, arbUserCode, (problem, userCode) => {
          const { workerRequest } = adaptForWorker(problem, userCode);
          const strategy = problem.validator.strategy;
          expect(workerRequest.code).toContain(`function ${strategy}`);
        }),
        { numRuns: 100 },
      );
    });
  });

  // ── 5c. Entry function aliasing ───────────────────────────────────────────

  describe('(c) Entry function aliasing: non-"solution" entryFunction generates alias', () => {
    it('entryFunction !== "solution" → code contains "var solution = <entryFunction>;"', () => {
      const arbNonSolutionIdentifier = arbJsIdentifier.filter((s) => s !== 'solution');
      const arbProblem = buildArbRichProblem({
        entryFunctionArb: arbNonSolutionIdentifier,
      });

      fc.assert(
        fc.property(arbProblem, arbUserCode, (problem, userCode) => {
          const { workerRequest } = adaptForWorker(problem, userCode);
          const entryFn = problem.executionConfig.entryFunction;
          expect(workerRequest.code).toContain(`var solution = ${entryFn};`);
        }),
        { numRuns: 100 },
      );
    });

    it('entryFunction === "solution" → code does NOT contain duplicate alias', () => {
      const arbProblem = buildArbRichProblem({
        entryFunctionArb: fc.constant('solution'),
      });

      fc.assert(
        fc.property(arbProblem, arbUserCode, (problem, userCode) => {
          const { workerRequest } = adaptForWorker(problem, userCode);
          expect(workerRequest.code).not.toContain('var solution = solution;');
        }),
        { numRuns: 50 },
      );
    });
  });

  // ── 5d. testCases equals problem.hiddenTestCases ──────────────────────────

  describe('(d) testCases equals problem.hiddenTestCases', () => {
    it('workerRequest.testCases is the same reference as problem.hiddenTestCases', () => {
      fc.assert(
        fc.property(buildArbRichProblem(), arbUserCode, (problem, userCode) => {
          const { workerRequest } = adaptForWorker(problem, userCode);
          expect(workerRequest.testCases).toEqual(problem.hiddenTestCases);
        }),
        { numRuns: 100 },
      );
    });

    it('workerRequest.testCases length equals hiddenTestCases length', () => {
      fc.assert(
        fc.property(buildArbRichProblem(), arbUserCode, (problem, userCode) => {
          const { workerRequest } = adaptForWorker(problem, userCode);
          expect(workerRequest.testCases.length).toBe(problem.hiddenTestCases.length);
        }),
        { numRuns: 100 },
      );
    });
  });

  // ── 5e. deepEqual strategy → NO extra comparator injected ─────────────────

  describe('(e) deepEqual strategy: code does NOT contain extra comparator injection', () => {
    it('deepEqual strategy → code does not contain "function treeEqual"', () => {
      const arbProblem = buildArbRichProblem({
        strategyArb: fc.constant('deepEqual' as const),
      });

      fc.assert(
        fc.property(arbProblem, arbUserCode, (problem, userCode) => {
          const { workerRequest } = adaptForWorker(problem, userCode);
          expect(workerRequest.code).not.toContain('function treeEqual');
        }),
        { numRuns: 100 },
      );
    });

    it('deepEqual strategy → code does not contain "function linkedListEqual"', () => {
      const arbProblem = buildArbRichProblem({
        strategyArb: fc.constant('deepEqual' as const),
      });

      fc.assert(
        fc.property(arbProblem, arbUserCode, (problem, userCode) => {
          const { workerRequest } = adaptForWorker(problem, userCode);
          expect(workerRequest.code).not.toContain('function linkedListEqual');
        }),
        { numRuns: 100 },
      );
    });

    it('deepEqual strategy → code does not contain "function unorderedArrayEqual"', () => {
      const arbProblem = buildArbRichProblem({
        strategyArb: fc.constant('deepEqual' as const),
      });

      fc.assert(
        fc.property(arbProblem, arbUserCode, (problem, userCode) => {
          const { workerRequest } = adaptForWorker(problem, userCode);
          expect(workerRequest.code).not.toContain('function unorderedArrayEqual');
        }),
        { numRuns: 100 },
      );
    });

    it('deepEqual strategy → code does not contain "function floatEqual"', () => {
      const arbProblem = buildArbRichProblem({
        strategyArb: fc.constant('deepEqual' as const),
      });

      fc.assert(
        fc.property(arbProblem, arbUserCode, (problem, userCode) => {
          const { workerRequest } = adaptForWorker(problem, userCode);
          expect(workerRequest.code).not.toContain('function floatEqual');
        }),
        { numRuns: 100 },
      );
    });
  });

  // ── Additional: AdapterOutput fields ──────────────────────────────────────

  describe('AdapterOutput fields match executionConfig', () => {
    it('timeoutMs equals executionConfig.timeoutMs', () => {
      fc.assert(
        fc.property(buildArbRichProblem(), arbUserCode, (problem, userCode) => {
          const output = adaptForWorker(problem, userCode);
          expect(output.timeoutMs).toBe(problem.executionConfig.timeoutMs);
        }),
        { numRuns: 100 },
      );
    });

    it('memoryLimitMb equals executionConfig.memoryLimitMb', () => {
      fc.assert(
        fc.property(buildArbRichProblem(), arbUserCode, (problem, userCode) => {
          const output = adaptForWorker(problem, userCode);
          expect(output.memoryLimitMb).toBe(problem.executionConfig.memoryLimitMb);
        }),
        { numRuns: 100 },
      );
    });
  });
});
