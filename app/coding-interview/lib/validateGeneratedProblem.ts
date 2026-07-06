/**
 * Validates that a parsed AI response matches the GeneratedProblem structure.
 *
 * This function is extracted from the generate-problem route so it can be
 * tested independently. It checks all required fields, types, and constraints.
 */

import type { GeneratedProblem } from './types';

export function validateGeneratedProblem(data: unknown): data is GeneratedProblem {
  if (!data || typeof data !== 'object') return false;

  const problem = data as Record<string, unknown>;

  // Check required string fields
  const requiredStrings = [
    'title', 'difficulty', 'category', 'statement',
    'inputFormat', 'outputFormat', 'expectedTimeComplexity',
    'expectedSpaceComplexity', 'starterCode', 'validator',
  ];
  for (const field of requiredStrings) {
    if (typeof problem[field] !== 'string' || (problem[field] as string).length === 0) {
      return false;
    }
  }

  // Validate difficulty
  if (!['easy', 'medium', 'hard'].includes(problem.difficulty as string)) {
    return false;
  }

  // Validate arrays with minimum counts
  if (!Array.isArray(problem.tags) || problem.tags.length < 2) return false;
  if (!Array.isArray(problem.samples) || problem.samples.length < 2) return false;
  if (!Array.isArray(problem.edgeCases) || problem.edgeCases.length < 2) return false;
  if (!Array.isArray(problem.hiddenTestCases) || problem.hiddenTestCases.length < 5) return false;
  if (!Array.isArray(problem.companyTags) || problem.companyTags.length < 1 || problem.companyTags.length > 5) return false;
  if (!Array.isArray(problem.constraints)) return false;

  // Validate sample structure
  for (const sample of problem.samples as Array<Record<string, unknown>>) {
    if (typeof sample.input !== 'string' || typeof sample.output !== 'string' || typeof sample.explanation !== 'string') {
      return false;
    }
  }

  // Validate edge case structure
  for (const edgeCase of problem.edgeCases as Array<Record<string, unknown>>) {
    if (typeof edgeCase.description !== 'string' || typeof edgeCase.input !== 'string' || typeof edgeCase.expectedOutput !== 'string') {
      return false;
    }
  }

  // Validate hidden test case structure
  for (const testCase of problem.hiddenTestCases as Array<Record<string, unknown>>) {
    if (!('input' in testCase) || !('expectedOutput' in testCase)) {
      return false;
    }
  }

  // Validate providedCode: object with language (string), imports (string[]), types (string[]), helpers (string[]), testHarness (string)
  if (!problem.providedCode || typeof problem.providedCode !== 'object') return false;
  const providedCode = problem.providedCode as Record<string, unknown>;
  if (typeof providedCode.language !== 'string') return false;
  if (!Array.isArray(providedCode.imports)) return false;
  if (!Array.isArray(providedCode.types)) return false;
  if (!Array.isArray(providedCode.helpers)) return false;
  if (typeof providedCode.testHarness !== 'string') return false;

  // Validate functionSignature: object with name (string), parameters (array of {name, type}), returnType (string)
  if (!problem.functionSignature || typeof problem.functionSignature !== 'object') return false;
  const functionSignature = problem.functionSignature as Record<string, unknown>;
  if (typeof functionSignature.name !== 'string') return false;
  if (!Array.isArray(functionSignature.parameters)) return false;
  for (const param of functionSignature.parameters as Array<Record<string, unknown>>) {
    if (typeof param.name !== 'string' || typeof param.type !== 'string') {
      return false;
    }
  }
  if (typeof functionSignature.returnType !== 'string') return false;

  // Validate dataStructures: array of objects with name (string) and definition (string) - can be empty
  if (!Array.isArray(problem.dataStructures)) return false;
  for (const ds of problem.dataStructures as Array<Record<string, unknown>>) {
    if (typeof ds.name !== 'string' || typeof ds.definition !== 'string') {
      return false;
    }
  }

  // Validate parser: object with inputType (string) and helper (string)
  if (!problem.parser || typeof problem.parser !== 'object') return false;
  const parser = problem.parser as Record<string, unknown>;
  if (typeof parser.inputType !== 'string') return false;
  if (typeof parser.helper !== 'string') return false;

  // Validate execution: object with entry (string), language (string), timeout (number), memory (number)
  if (!problem.execution || typeof problem.execution !== 'object') return false;
  const execution = problem.execution as Record<string, unknown>;
  if (typeof execution.entry !== 'string') return false;
  if (typeof execution.language !== 'string') return false;
  if (typeof execution.timeout !== 'number') return false;
  if (typeof execution.memory !== 'number') return false;

  // Validate interview: object with expectedPatterns (string[]), followUpTopics (string[]), commonMistakes (string[]), optimizationQuestions (string[])
  if (!problem.interview || typeof problem.interview !== 'object') return false;
  const interview = problem.interview as Record<string, unknown>;
  if (!Array.isArray(interview.expectedPatterns)) return false;
  if (!Array.isArray(interview.followUpTopics)) return false;
  if (!Array.isArray(interview.commonMistakes)) return false;
  if (!Array.isArray(interview.optimizationQuestions)) return false;

  // Validate hints: non-empty array of objects with level (number) and content (string)
  if (!Array.isArray(problem.hints) || problem.hints.length < 1) return false;
  for (const hint of problem.hints as Array<Record<string, unknown>>) {
    if (typeof hint.level !== 'number' || typeof hint.content !== 'string') {
      return false;
    }
  }

  return true;
}
