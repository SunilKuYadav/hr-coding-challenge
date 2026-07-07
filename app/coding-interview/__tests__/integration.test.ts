import { describe, it, expect, beforeEach } from 'vitest';
import { assembleProblem, type AICoreOutput } from '../services/assemblyLayer';
import { adaptForWorker } from '../services/executionAdapter';
import { RichProblemSchema } from '../lib/schemas';
import { useInterviewStore } from '../store/interviewStore';

/**
 * Integration tests for end-to-end flow:
 * mock AI response → assembly → validation → adapter → WorkerRequest structure
 *
 * Validates: Requirements 3.4, 10.2, 10.3, 10.4
 */

// ── Test Fixtures ──────────────────────────────────────────────────────────

function createMockAICoreOutput(overrides?: Partial<AICoreOutput>): AICoreOutput {
  return {
    title: 'Invert Binary Tree',
    difficulty: 'medium',
    category: 'Trees',
    tags: ['Trees', 'Recursion', 'DFS'],
    statement: 'Given the root of a binary tree, invert the tree and return its root.',
    constraints: ['The number of nodes is in the range [0, 100]', '-100 <= Node.val <= 100'],
    inputFormat: 'An array representing a binary tree in level-order traversal',
    outputFormat: 'An array representing the inverted binary tree in level-order traversal',
    samples: [
      { input: '[4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]', explanation: 'The tree is inverted by swapping left and right children at every node.' },
      { input: '[2,1,3]', output: '[2,3,1]', explanation: 'Simple swap of left and right children.' },
    ],
    edgeCases: [
      { description: 'Empty tree', input: '[]', expectedOutput: '[]' },
      { description: 'Single node', input: '[1]', expectedOutput: '[1]' },
    ],
    hiddenTestCases: [
      { input: [4, 2, 7, 1, 3, 6, 9], expectedOutput: [4, 7, 2, 9, 6, 3, 1] },
      { input: [2, 1, 3], expectedOutput: [2, 3, 1] },
      { input: [1], expectedOutput: [1] },
      { input: [], expectedOutput: [] },
      { input: [1, 2], expectedOutput: [1, null, 2] },
    ],
    expectedTimeComplexity: 'O(n)',
    expectedSpaceComplexity: 'O(n)',
    companyTags: ['Google', 'Amazon'],
    functionSignature: {
      name: 'invertTree',
      parameters: [{ name: 'root', type: 'TreeNode | null' }],
      returnType: 'TreeNode | null',
    },
    hints: [
      { level: 1, content: 'Think about what it means to invert a tree.' },
      { level: 2, content: 'Try swapping the left and right children recursively.' },
      { level: 3, content: 'Use a simple recursive approach: swap children, then recurse on each subtree.' },
    ],
    interviewMetadata: {
      expectedPatterns: ['Recursion', 'Tree Traversal'],
      followUpTopics: ['Iterative BFS approach', 'Time vs space tradeoffs'],
      commonMistakes: ['Forgetting the base case for null nodes', 'Only swapping at one level'],
      optimizationQuestions: ['Can you solve this iteratively?'],
    },
    ...overrides,
  };
}

function createArrayProblemMockAI(): AICoreOutput {
  return createMockAICoreOutput({
    title: 'Two Sum',
    category: 'Arrays',
    tags: ['Arrays', 'Hash Table'],
    statement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    functionSignature: {
      name: 'twoSum',
      parameters: [
        { name: 'nums', type: 'number[]' },
        { name: 'target', type: 'number' },
      ],
      returnType: 'number[]',
    },
    hiddenTestCases: [
      { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
      { input: [[3, 2, 4], 6], expectedOutput: [1, 2] },
      { input: [[3, 3], 6], expectedOutput: [0, 1] },
      { input: [[1, 2, 3, 4, 5], 9], expectedOutput: [3, 4] },
      { input: [[-1, -2, -3, -4, -5], -8], expectedOutput: [2, 4] },
    ],
    companyTags: ['Google', 'Facebook', 'Amazon'],
  });
}

function createLinkedListMockAI(): AICoreOutput {
  return createMockAICoreOutput({
    title: 'Reverse Linked List',
    category: 'Linked Lists',
    tags: ['Linked Lists', 'Iterative'],
    statement: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    functionSignature: {
      name: 'reverseList',
      parameters: [{ name: 'head', type: 'ListNode | null' }],
      returnType: 'ListNode | null',
    },
    hiddenTestCases: [
      { input: [1, 2, 3, 4, 5], expectedOutput: [5, 4, 3, 2, 1] },
      { input: [1, 2], expectedOutput: [2, 1] },
      { input: [1], expectedOutput: [1] },
      { input: [], expectedOutput: [] },
      { input: [1, 2, 3], expectedOutput: [3, 2, 1] },
    ],
    companyTags: ['Microsoft'],
  });
}

// ── Test Suite ─────────────────────────────────────────────────────────────

describe('Integration: End-to-end flow (AI → Assembly → Validation → Adapter → WorkerRequest)', () => {
  describe('Test 1: Trees category — full pipeline', () => {
    it('assembles, validates, and adapts a tree problem correctly', () => {
      const mockAI = createMockAICoreOutput();

      // Step 1: Assembly
      const problem = assembleProblem(mockAI, 'javascript');

      // Step 2: Validation
      const parseResult = RichProblemSchema.safeParse(problem);
      expect(parseResult.success).toBe(true);

      // Step 3: Adapter
      const userCode = `function invertTree(root) {\n  if (!root) return null;\n  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];\n  return root;\n}`;
      const adapterOutput = adaptForWorker(problem, userCode);

      // Verify WorkerRequest structure
      expect(adapterOutput.workerRequest).toBeDefined();
      expect(adapterOutput.workerRequest.code).toBeDefined();
      expect(adapterOutput.workerRequest.testCases).toEqual(mockAI.hiddenTestCases);
      expect(adapterOutput.workerRequest.maxOutputLength).toBe(10000);

      // Verify code ordering: providedCode → helperFunctions → userCode
      const code = adapterOutput.workerRequest.code;
      expect(code.indexOf(problem.providedCode)).toBeLessThan(code.indexOf(problem.helperFunctions));
      expect(code.indexOf(problem.helperFunctions)).toBeLessThan(code.indexOf(userCode));

      // Verify tree-specific behavior
      expect(code).toContain('function treeEqual'); // comparator injected
      expect(code).toContain('class TreeNode'); // helper injected
      expect(code).toContain('var solution = invertTree;'); // entry alias

      // Verify timeout/memory from executionConfig
      expect(adapterOutput.timeoutMs).toBe(5000);
      expect(adapterOutput.memoryLimitMb).toBe(256);
    });

    it('assembly produces correct parser and validator for Trees', () => {
      const mockAI = createMockAICoreOutput();
      const problem = assembleProblem(mockAI, 'javascript');

      expect(problem.parser.inputType).toBe('binary-tree');
      expect(problem.validator.strategy).toBe('treeEqual');
    });
  });

  describe('Test 1b: Arrays category — full pipeline', () => {
    it('assembles, validates, and adapts an array problem correctly', () => {
      const mockAI = createArrayProblemMockAI();

      const problem = assembleProblem(mockAI, 'javascript');

      const parseResult = RichProblemSchema.safeParse(problem);
      expect(parseResult.success).toBe(true);

      const userCode = `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n}`;
      const adapterOutput = adaptForWorker(problem, userCode);

      const code = adapterOutput.workerRequest.code;

      // deepEqual strategy — no comparator injected
      expect(code).not.toContain('function treeEqual');
      expect(code).not.toContain('function linkedListEqual');
      expect(code).not.toContain('function unorderedArrayEqual');
      expect(code).not.toContain('function floatEqual');

      // entry alias for twoSum
      expect(code).toContain('var solution = twoSum;');

      // testCases match
      expect(adapterOutput.workerRequest.testCases).toEqual(mockAI.hiddenTestCases);
    });

    it('uses default parser/validator for unknown category', () => {
      const mockAI = createArrayProblemMockAI();
      const problem = assembleProblem(mockAI, 'javascript');

      expect(problem.parser.inputType).toBe('array');
      expect(problem.validator.strategy).toBe('deepEqual');
    });
  });

  describe('Test 1c: Linked Lists category — full pipeline', () => {
    it('assembles, validates, and adapts a linked list problem correctly', () => {
      const mockAI = createLinkedListMockAI();

      const problem = assembleProblem(mockAI, 'javascript');

      const parseResult = RichProblemSchema.safeParse(problem);
      expect(parseResult.success).toBe(true);

      const userCode = `function reverseList(head) {\n  let prev = null;\n  let curr = head;\n  while (curr) {\n    const next = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = next;\n  }\n  return prev;\n}`;
      const adapterOutput = adaptForWorker(problem, userCode);

      const code = adapterOutput.workerRequest.code;

      // Linked list specific
      expect(code).toContain('function linkedListEqual');
      expect(code).toContain('class ListNode');
      expect(code).toContain('var solution = reverseList;');

      expect(problem.parser.inputType).toBe('linked-list');
      expect(problem.validator.strategy).toBe('linkedListEqual');
    });
  });
});

describe('Integration: Store receives RichProblem — both rich fields and legacy boilerplate populated', () => {
  beforeEach(() => {
    // Reset store to defaults before each test
    useInterviewStore.getState().clearSession();
  });

  it('setProblem populates problem, boilerplate, and code from a tree problem', () => {
    const mockAI = createMockAICoreOutput();
    const richProblem = assembleProblem(mockAI, 'javascript');

    useInterviewStore.getState().setProblem(richProblem);

    const state = useInterviewStore.getState();

    // Rich structured fields populated
    expect(state.problem).not.toBeNull();
    expect(state.problem!.title).toBe('Invert Binary Tree');
    expect(state.problem!.starterCode).toContain('function invertTree');
    expect(state.problem!.providedCode).toBeTruthy();
    expect(state.problem!.helperFunctions).toContain('class TreeNode');
    expect(state.problem!.functionSignature.name).toBe('invertTree');
    expect(state.problem!.parser.inputType).toBe('binary-tree');
    expect(state.problem!.validator.strategy).toBe('treeEqual');
    expect(state.problem!.executionConfig.entryFunction).toBe('invertTree');
    expect(state.problem!.hints.length).toBeGreaterThanOrEqual(1);
    expect(state.problem!.interviewMetadata.expectedPatterns.length).toBeGreaterThanOrEqual(1);

    // Legacy boilerplate populated
    expect(state.boilerplate).toBeTruthy();
    expect(state.boilerplate).toBe(richProblem.boilerplate);
    // boilerplate is concatenation of providedCode + helperFunctions + starterCode
    expect(state.boilerplate).toContain(richProblem.providedCode);
    expect(state.boilerplate).toContain(richProblem.helperFunctions);
    expect(state.boilerplate).toContain(richProblem.starterCode);

    // code is set to starterCode
    expect(state.code).toBe(richProblem.starterCode);
    expect(state.code).toContain('function invertTree');
    expect(state.code).toContain('// TODO: Implement your solution here');
  });

  it('setProblem populates problem, boilerplate, and code from an array problem', () => {
    const mockAI = createArrayProblemMockAI();
    const richProblem = assembleProblem(mockAI, 'javascript');

    useInterviewStore.getState().setProblem(richProblem);

    const state = useInterviewStore.getState();

    // Rich fields
    expect(state.problem).not.toBeNull();
    expect(state.problem!.title).toBe('Two Sum');
    expect(state.problem!.starterCode).toContain('function twoSum');
    expect(state.problem!.functionSignature.name).toBe('twoSum');
    expect(state.problem!.parser.inputType).toBe('array');
    expect(state.problem!.validator.strategy).toBe('deepEqual');

    // Legacy boilerplate
    expect(state.boilerplate).toBe(richProblem.boilerplate);

    // code set to starterCode
    expect(state.code).toBe(richProblem.starterCode);
  });
});

describe('Integration: Backward compatibility — deepEqual strategy produces legacy-compatible WorkerRequest', () => {
  it('deepEqual strategy does NOT inject comparator code', () => {
    const mockAI = createArrayProblemMockAI();
    const problem = assembleProblem(mockAI, 'javascript');

    expect(problem.validator.strategy).toBe('deepEqual');

    const userCode = `function twoSum(nums, target) { return [0, 1]; }`;
    const adapterOutput = adaptForWorker(problem, userCode);

    const code = adapterOutput.workerRequest.code;

    // No comparator injected (backward compatible with legacy worker format)
    expect(code).not.toContain('function treeEqual');
    expect(code).not.toContain('function linkedListEqual');
    expect(code).not.toContain('function unorderedArrayEqual');
    expect(code).not.toContain('function floatEqual');

    // Still has correct structure
    expect(adapterOutput.workerRequest.testCases).toEqual(problem.hiddenTestCases);
    expect(adapterOutput.workerRequest.maxOutputLength).toBe(10000);
    expect(adapterOutput.timeoutMs).toBe(problem.executionConfig.timeoutMs);
    expect(adapterOutput.memoryLimitMb).toBe(problem.executionConfig.memoryLimitMb);
  });

  it('deepEqual WorkerRequest contains code in correct order without extra injections', () => {
    const mockAI = createArrayProblemMockAI();
    const problem = assembleProblem(mockAI, 'javascript');

    const userCode = `function twoSum(nums, target) { return [0, 1]; }`;
    const adapterOutput = adaptForWorker(problem, userCode);

    const code = adapterOutput.workerRequest.code;

    // providedCode appears first (when present)
    if (problem.providedCode) {
      expect(code.startsWith(problem.providedCode)).toBe(true);
    }

    // userCode is present
    expect(code).toContain(userCode);

    // Entry alias still present since function name is not 'solution'
    expect(code).toContain('var solution = twoSum;');
  });

  it('when entryFunction is "solution", no alias is appended', () => {
    const mockAI = createMockAICoreOutput({
      functionSignature: {
        name: 'solution',
        parameters: [{ name: 'nums', type: 'number[]' }],
        returnType: 'number[]',
      },
    });
    const problem = assembleProblem(mockAI, 'javascript');

    const userCode = `function solution(nums) { return nums; }`;
    const adapterOutput = adaptForWorker(problem, userCode);

    const code = adapterOutput.workerRequest.code;
    expect(code).not.toContain('var solution = solution;');
  });
});
