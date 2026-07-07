/**
 * Execution adapter that maps a RichProblem + user code into the WorkerRequest
 * interface expected by executionWorker.ts, without modifying the worker itself.
 */

import type { RichProblem } from '../lib/schemas';

interface WorkerRequest {
  code: string;
  testCases: Array<{ input: unknown; expectedOutput: unknown }>;
  maxOutputLength: number;
}

export interface AdapterOutput {
  workerRequest: WorkerRequest;
  timeoutMs: number;
  memoryLimitMb: number;
}

// Comparator implementations for non-deepEqual strategies.
// These are injected as strings into the worker code payload when needed.
const COMPARATOR_CODE: Record<string, string> = {
  treeEqual: `
function treeEqual(a, b) {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  return a.val === b.val && treeEqual(a.left, b.left) && treeEqual(a.right, b.right);
}`,

  linkedListEqual: `
function linkedListEqual(a, b) {
  while (a !== null && b !== null) {
    if (a.val !== b.val) return false;
    a = a.next;
    b = b.next;
  }
  return a === null && b === null;
}`,

  unorderedArrayEqual: `
function unorderedArrayEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const sorted = (arr) => [...arr].sort((x, y) => JSON.stringify(x) < JSON.stringify(y) ? -1 : 1);
  return JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));
}`,

  floatEqual: `
function floatEqual(a, b, epsilon = 1e-6) {
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < epsilon;
  }
  return a === b;
}`,
};

/**
 * Adapts a RichProblem and user-submitted code into a WorkerRequest.
 *
 * Assembly order: providedCode → helperFunctions → userCode
 * This ensures class definitions and utility functions are available
 * before user code references them.
 *
 * If validator.strategy is not 'deepEqual', the corresponding comparator
 * implementation is appended so the worker can use it.
 *
 * If executionConfig.entryFunction is not 'solution', an alias
 * `var solution = <entryFunction>;` is appended so the worker can invoke
 * the function by its expected name.
 */
export function adaptForWorker(problem: RichProblem, userCode: string): AdapterOutput {
  const { providedCode, helperFunctions, executionConfig, validator } = problem;
  const strategy = validator.strategy;

  // 1. Build executable code: providedCode → helperFunctions → userCode
  const codeParts: string[] = [];

  if (providedCode) codeParts.push(providedCode);
  if (helperFunctions) codeParts.push(helperFunctions);
  codeParts.push(userCode);

  // 2. Inject comparator if non-deepEqual strategy
  if (strategy !== 'deepEqual' && COMPARATOR_CODE[strategy]) {
    codeParts.push(COMPARATOR_CODE[strategy]);
  }

  // 3. Alias entryFunction to 'solution' if different (worker expects `solution`)
  const entryFn = executionConfig.entryFunction;
  if (entryFn !== 'solution') {
    codeParts.push(`\nvar solution = ${entryFn};`);
  }

  const code = codeParts.join('\n\n');

  // 4. Build WorkerRequest and return AdapterOutput
  return {
    workerRequest: {
      code,
      testCases: problem.hiddenTestCases,
      maxOutputLength: 10000,
    },
    timeoutMs: executionConfig.timeoutMs,
    memoryLimitMb: executionConfig.memoryLimitMb,
  };
}
