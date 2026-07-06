import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Bug Condition Exploration Test
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8**
 *
 * Property 1: Bug Condition - Flat Boilerplate Schema Returns No Structured Fields
 *
 * This test encodes the EXPECTED behavior: a valid GeneratedProblem response should
 * contain structured fields (providedCode, starterCode, functionSignature, dataStructures,
 * parser, validator, execution, interview, hints) instead of a flat `boilerplate` string.
 *
 * On UNFIXED code, this test MUST FAIL because the current validateGeneratedProblem
 * function only checks for `boilerplate` and does NOT check for structured fields.
 * Failure confirms the bug exists.
 */

// Import the validateGeneratedProblem function from the route module
// We need to extract it for direct testing - import the module
import { validateGeneratedProblem } from '../lib/validateGeneratedProblem';

/**
 * Generates a valid base problem with all existing required fields.
 * These fields are the ones that should remain unchanged after the fix.
 */
function makeBaseFields() {
  return {
    title: 'Two Sum',
    difficulty: 'easy' as const,
    category: 'Arrays',
    tags: ['arrays', 'hash-map'],
    statement: 'Given an array of integers nums and an integer target...',
    constraints: ['2 <= nums.length <= 10^4'],
    inputFormat: 'Array of integers and target integer',
    outputFormat: 'Array of two indices',
    samples: [
      { input: '[2,7,11,15], 9', output: '[0,1]', explanation: '2 + 7 = 9' },
      { input: '[3,2,4], 6', output: '[1,2]', explanation: '2 + 4 = 6' },
    ],
    edgeCases: [
      { description: 'Negative numbers', input: '[-1,-2,-3,-4,-5], -8', expectedOutput: '[2,4]' },
      { description: 'Same element twice', input: '[3,3], 6', expectedOutput: '[0,1]' },
    ],
    hiddenTestCases: [
      { input: [1, 2, 3], expectedOutput: [0, 1] },
      { input: [4, 5, 6], expectedOutput: [0, 2] },
      { input: [1, 1, 1], expectedOutput: [0, 1] },
      { input: [10, 20, 30], expectedOutput: [0, 1] },
      { input: [5, 5, 5], expectedOutput: [0, 1] },
    ],
    expectedTimeComplexity: 'O(n)',
    expectedSpaceComplexity: 'O(n)',
    companyTags: ['Google', 'Amazon', 'Meta'],
  };
}

/**
 * Generates a complete response with the NEW expected structured fields.
 * This represents what the fixed code SHOULD produce.
 */
function makeEnhancedResponse(overrides: Record<string, unknown> = {}) {
  return {
    ...makeBaseFields(),
    // NEW structured fields (expected after fix)
    providedCode: {
      language: 'javascript',
      imports: [],
      types: [],
      helpers: [],
      testHarness: 'const assert = require("assert");',
    },
    starterCode: 'function twoSum(nums, target) {\n  // TODO\n}',
    functionSignature: {
      name: 'twoSum',
      parameters: [
        { name: 'nums', type: 'number[]' },
        { name: 'target', type: 'number' },
      ],
      returnType: 'number[]',
    },
    dataStructures: [],
    parser: {
      inputType: 'array',
      helper: 'identity',
    },
    validator: 'deepEqual',
    execution: {
      entry: 'twoSum',
      language: 'javascript',
      timeout: 5000,
      memory: 256,
    },
    interview: {
      expectedPatterns: ['hash-map-lookup'],
      followUpTopics: ['time-space-tradeoff'],
      commonMistakes: ['using-same-element-twice'],
      optimizationQuestions: ['can-you-do-it-in-one-pass'],
    },
    hints: [
      { level: 1, content: 'Think about what data structure allows O(1) lookup.' },
      { level: 2, content: 'Use a hash map to store complements.' },
    ],
    ...overrides,
  };
}

describe('Bug Condition Exploration - Property 1: Flat Boilerplate Schema Returns No Structured Fields', () => {
  /**
   * Property-based test: For any valid GenerateProblemRequest that produces a 200 response,
   * the response should contain structured fields and pass the enhanced validator.
   *
   * This test FAILS on unfixed code because:
   * - The current validateGeneratedProblem checks for `boilerplate` (a string)
   * - The current validateGeneratedProblem does NOT check for providedCode, starterCode,
   *   functionSignature, dataStructures, parser, validator, execution, interview, hints
   * - A response with the new structured schema will fail the current validator
   *   because it lacks the `boilerplate` field
   */
  it('enhanced response with structured fields passes validateGeneratedProblem', () => {
    // Arbitrary for different problem configurations
    const arbLanguage = fc.constantFrom('javascript', 'typescript');
    const arbDifficulty = fc.constantFrom('easy', 'medium', 'hard');
    const arbCategory = fc.constantFrom('Arrays', 'Trees', 'Graphs', 'Dynamic Programming', 'Linked Lists');
    const arbValidator = fc.constantFrom('deepEqual', 'treeEqual', 'linkedListEqual', 'unorderedEqual');

    fc.assert(
      fc.property(
        arbLanguage,
        arbDifficulty,
        arbCategory,
        arbValidator,
        (language, difficulty, category, validator) => {
          // Build a response with the EXPECTED enhanced structure
          const response = makeEnhancedResponse({
            difficulty,
            category,
            providedCode: {
              language,
              imports: [],
              types: [],
              helpers: [],
              testHarness: `const assert = require("assert");`,
            },
            execution: {
              entry: 'solution',
              language,
              timeout: 5000,
              memory: 256,
            },
            validator,
          });

          // The enhanced response should pass validation
          // On UNFIXED code, this FAILS because the validator requires `boilerplate`
          // and does not recognize the new structured fields
          const isValid = validateGeneratedProblem(response);
          expect(isValid).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Bug condition check: A response with ONLY `boilerplate` (current behavior)
   * should be detected as having the bug condition - it has `boilerplate` but
   * lacks all structured fields.
   *
   * On UNFIXED code this FAILS because isBugCondition returns true
   * (the response passes current validation but lacks structured fields).
   */
  it('response with only boilerplate triggers bug condition (lacks structured fields)', () => {
    const arbBoilerplate = fc.constantFrom(
      'function twoSum(nums, target) { // TODO }',
      'function inorderTraversal(root: TreeNode | null): number[] { // TODO }',
      'function shortestPath(graph, start, end) { // TODO }'
    );

    fc.assert(
      fc.property(arbBoilerplate, (boilerplate) => {
        // Build a response with ONLY the flat boilerplate (current behavior)
        const response = {
          ...makeBaseFields(),
          boilerplate,
        };

        // Bug condition: has boilerplate but NO structured fields
        const hasBoilerplate = typeof (response as Record<string, unknown>).boilerplate === 'string';
        const hasProvidedCode = 'providedCode' in response && typeof (response as Record<string, unknown>).providedCode === 'object';
        const hasStarterCode = 'starterCode' in response && typeof (response as Record<string, unknown>).starterCode === 'string';
        const hasFunctionSignature = 'functionSignature' in response && typeof (response as Record<string, unknown>).functionSignature === 'object';
        const hasDataStructures = 'dataStructures' in response && Array.isArray((response as Record<string, unknown>).dataStructures);
        const hasParser = 'parser' in response && typeof (response as Record<string, unknown>).parser === 'object';
        const hasValidatorField = 'validator' in response && typeof (response as Record<string, unknown>).validator === 'string';
        const hasExecution = 'execution' in response && typeof (response as Record<string, unknown>).execution === 'object';
        const hasInterview = 'interview' in response && typeof (response as Record<string, unknown>).interview === 'object';
        const hasHints = 'hints' in response && Array.isArray((response as Record<string, unknown>).hints);

        // The bug condition: has boilerplate but lacks ALL structured fields
        const isBugCondition = hasBoilerplate
          && !hasProvidedCode
          && !hasStarterCode
          && !hasFunctionSignature
          && !hasDataStructures
          && !hasParser
          && !hasValidatorField
          && !hasExecution
          && !hasInterview
          && !hasHints;

        // Assert the bug condition is TRUE (response has boilerplate, lacks structured fields)
        expect(isBugCondition).toBe(true);

        // The current validator should REJECT this response when it checks for structured fields
        // On UNFIXED code: the validator ACCEPTS this (because it only checks boilerplate)
        // After fix: the validator should REJECT this (because it requires structured fields)
        const passesEnhancedValidation = validateGeneratedProblem(response);
        expect(passesEnhancedValidation).toBe(false);
      }),
      { numRuns: 20 }
    );
  });
});
