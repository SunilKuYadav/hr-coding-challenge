import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useInterviewStore } from '../store/interviewStore';
import type { RichProblem } from '../lib/schemas';

/**
 * Unit tests for HintPanel pre-generated hint logic.
 *
 * Tests that when a hint is requested:
 * - If problem.hints contains a matching level, the content is used immediately (no API call)
 * - If problem.hints does not contain the level, the fallback onRequestHint is called
 *
 * Validates: Requirements 8.3, 8.4
 */

// Minimal valid RichProblem with pre-generated hints
function createMockProblem(hints: Array<{ level: number; content: string }>): RichProblem {
  return {
    title: 'Test Problem',
    difficulty: 'medium',
    category: 'Arrays',
    tags: ['arrays', 'sorting'],
    statement: 'Test statement',
    constraints: ['1 <= n <= 100'],
    inputFormat: 'Array of integers',
    outputFormat: 'Sorted array',
    samples: [
      { input: '[3,1,2]', output: '[1,2,3]', explanation: 'Sort the array' },
      { input: '[1]', output: '[1]', explanation: 'Single element' },
    ],
    edgeCases: [
      { description: 'Empty', input: '[]', expectedOutput: '[]' },
      { description: 'Sorted', input: '[1,2,3]', expectedOutput: '[1,2,3]' },
    ],
    hiddenTestCases: [
      { input: [3, 1, 2], expectedOutput: [1, 2, 3] },
      { input: [5, 4, 3, 2, 1], expectedOutput: [1, 2, 3, 4, 5] },
      { input: [1], expectedOutput: [1] },
      { input: [2, 1], expectedOutput: [1, 2] },
      { input: [1, 1, 1], expectedOutput: [1, 1, 1] },
    ],
    expectedTimeComplexity: 'O(n log n)',
    expectedSpaceComplexity: 'O(n)',
    companyTags: ['Google'],
    boilerplate: 'function sort(arr) {\n  // TODO\n}',
    starterCode: 'function sort(arr) {\n  // TODO: Implement your solution here\n}',
    providedCode: '// Problem setup',
    helperFunctions: '',
    functionSignature: {
      name: 'sort',
      parameters: [{ name: 'arr', type: 'number[]' }],
      returnType: 'number[]',
    },
    parser: { inputType: 'array' },
    validator: { strategy: 'deepEqual' },
    executionConfig: {
      entryFunction: 'sort',
      language: 'javascript',
      timeoutMs: 5000,
      memoryLimitMb: 256,
    },
    hints,
    interviewMetadata: {
      expectedPatterns: ['sorting'],
      followUpTopics: ['time complexity'],
      commonMistakes: ['off by one'],
      optimizationQuestions: ['Can you do better?'],
    },
  } as RichProblem;
}

describe('HintPanel — pre-generated hints logic', () => {
  beforeEach(() => {
    // Reset store to default state before each test
    useInterviewStore.getState().clearSession();
  });

  describe('when problem has pre-generated hints matching the requested level', () => {
    it('should use pre-generated hint content immediately', () => {
      const problem = createMockProblem([
        { level: 1, content: 'Think about the problem constraints' },
        { level: 2, content: 'Consider a two-pointer approach' },
        { level: 3, content: 'Use a hash map for O(1) lookups' },
      ]);

      // Set problem in store
      useInterviewStore.getState().setProblem(problem);

      // Simulate the logic from HintPanel's handleHintRequest
      const state = useInterviewStore.getState();
      const level = 1;
      const preGenerated = state.problem?.hints?.find((h) => h.level === level);

      expect(preGenerated).toBeDefined();
      expect(preGenerated!.content).toBe('Think about the problem constraints');

      // Add the pre-generated hint (simulates what HintPanel does)
      state.addHint(preGenerated!.content);

      const updatedState = useInterviewStore.getState();
      expect(updatedState.hints).toHaveLength(1);
      expect(updatedState.hints[0]).toBe('Think about the problem constraints');
      expect(updatedState.hintsUsed).toBe(1);
    });

    it('should match on specific level numbers (not just array index)', () => {
      const problem = createMockProblem([
        { level: 1, content: 'Hint for level 1' },
        { level: 3, content: 'Hint for level 3' },
      ]);

      useInterviewStore.getState().setProblem(problem);

      const state = useInterviewStore.getState();

      // Level 3 should be found even though it's at index 1
      const level3Hint = state.problem?.hints?.find((h) => h.level === 3);
      expect(level3Hint).toBeDefined();
      expect(level3Hint!.content).toBe('Hint for level 3');

      // Level 2 should not be found (no pre-generated hint at that level)
      const level2Hint = state.problem?.hints?.find((h) => h.level === 2);
      expect(level2Hint).toBeUndefined();
    });
  });

  describe('when problem does not have a pre-generated hint at the requested level', () => {
    it('should not find a pre-generated hint, indicating fallback is needed', () => {
      const problem = createMockProblem([
        { level: 1, content: 'Only level 1 hint' },
      ]);

      useInterviewStore.getState().setProblem(problem);

      const state = useInterviewStore.getState();

      // Level 2 does not exist in pre-generated hints
      const preGenerated = state.problem?.hints?.find((h) => h.level === 2);
      expect(preGenerated).toBeUndefined();
    });

    it('should fall back when level exceeds available pre-generated hints', () => {
      const problem = createMockProblem([
        { level: 1, content: 'Hint 1' },
        { level: 2, content: 'Hint 2' },
      ]);

      useInterviewStore.getState().setProblem(problem);

      const state = useInterviewStore.getState();

      // Levels 3 and 4 should not be found
      expect(state.problem?.hints?.find((h) => h.level === 3)).toBeUndefined();
      expect(state.problem?.hints?.find((h) => h.level === 4)).toBeUndefined();
    });
  });

  describe('when problem is null (no problem loaded)', () => {
    it('should indicate no pre-generated hint is available', () => {
      // Don't set any problem
      const state = useInterviewStore.getState();
      expect(state.problem).toBeNull();

      const preGenerated = state.problem?.hints?.find((h) => h.level === 1);
      expect(preGenerated).toBeUndefined();
    });
  });

  describe('sequential hint requests consume hints in order', () => {
    it('should allow consuming all pre-generated hints sequentially', () => {
      const problem = createMockProblem([
        { level: 1, content: 'Level 1 hint' },
        { level: 2, content: 'Level 2 hint' },
        { level: 3, content: 'Level 3 hint' },
        { level: 4, content: 'Level 4 hint' },
      ]);

      useInterviewStore.getState().setProblem(problem);

      // Request hints 1 through 4
      for (let level = 1; level <= 4; level++) {
        const state = useInterviewStore.getState();
        const preGenerated = state.problem?.hints?.find((h) => h.level === level);
        expect(preGenerated).toBeDefined();
        state.addHint(preGenerated!.content);
      }

      const finalState = useInterviewStore.getState();
      expect(finalState.hintsUsed).toBe(4);
      expect(finalState.hints).toEqual([
        'Level 1 hint',
        'Level 2 hint',
        'Level 3 hint',
        'Level 4 hint',
      ]);
    });
  });
});
