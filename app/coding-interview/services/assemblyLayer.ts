import { RichProblemSchema, type RichProblem } from '../lib/schemas';
import { getCategoryHelpers } from './categoryHelpers';

// Maps problem categories/tags to data structure types
const CATEGORY_MAP: Record<
  string,
  {
    parserInputType: 'binary-tree' | 'linked-list' | 'matrix' | 'graph' | 'array' | 'string';
    validatorStrategy: 'deepEqual' | 'linkedListEqual' | 'treeEqual' | 'unorderedArrayEqual' | 'floatEqual';
  }
> = {
  Trees:          { parserInputType: 'binary-tree', validatorStrategy: 'treeEqual' },
  'Binary Trees': { parserInputType: 'binary-tree', validatorStrategy: 'treeEqual' },
  'Linked Lists': { parserInputType: 'linked-list', validatorStrategy: 'linkedListEqual' },
  Graphs:         { parserInputType: 'graph',        validatorStrategy: 'deepEqual' },
  Matrices:       { parserInputType: 'matrix',       validatorStrategy: 'deepEqual' },
};

const DEFAULT_PARSER_INPUT_TYPE = 'array' as const;
const DEFAULT_VALIDATOR_STRATEGY = 'deepEqual' as const;

export interface AICoreOutput {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  statement: string;
  constraints: string[];
  inputFormat: string;
  outputFormat: string;
  samples: Array<{ input: string; output: string; explanation: string }>;
  edgeCases: Array<{ description: string; input: string; expectedOutput: string }>;
  hiddenTestCases: Array<{ input: unknown; expectedOutput: unknown }>;
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
  companyTags: string[];
  functionSignature: {
    name: string;
    parameters: Array<{ name: string; type: string }>;
    returnType: string;
  };
  hints: Array<{ level: number; content: string }>;
  interviewMetadata: {
    expectedPatterns: string[];
    followUpTopics: string[];
    commonMistakes: string[];
    optimizationQuestions: string[];
  };
}

/**
 * Resolves the parser input type, validator strategy, and detected category
 * from a raw category string and tag list.
 *
 * Resolution order:
 *  1. Direct match against CATEGORY_MAP keys
 *  2. Tag-based fallback (case-insensitive substring match)
 *  3. Default: array / deepEqual
 */
function resolveCategoryConfig(category: string, tags: string[]): {
  parserInputType: 'binary-tree' | 'linked-list' | 'matrix' | 'graph' | 'array' | 'string';
  validatorStrategy: 'deepEqual' | 'linkedListEqual' | 'treeEqual' | 'unorderedArrayEqual' | 'floatEqual';
  detectedCategory: string;
} {
  // 1. Direct category match (use hasOwn to avoid Object.prototype property collisions)
  if (Object.prototype.hasOwnProperty.call(CATEGORY_MAP, category)) {
    return { ...CATEGORY_MAP[category], detectedCategory: category };
  }

  // 2. Tag-based detection
  for (const tag of tags) {
    for (const [cat, config] of Object.entries(CATEGORY_MAP)) {
      if (tag.toLowerCase().includes(cat.toLowerCase())) {
        return { ...config, detectedCategory: cat };
      }
    }
  }

  // 3. Default fallback
  return {
    parserInputType: DEFAULT_PARSER_INPUT_TYPE,
    validatorStrategy: DEFAULT_VALIDATOR_STRATEGY,
    detectedCategory: 'default',
  };
}

/**
 * Generates a starter code template from a function signature.
 *
 * - JavaScript: parameter names only
 * - TypeScript: `name: type` annotations + return type annotation
 */
export function generateStarterCode(
  sig: AICoreOutput['functionSignature'],
  language: 'javascript' | 'typescript',
): string {
  const params = sig.parameters
    .map((p) => (language === 'typescript' ? `${p.name}: ${p.type}` : p.name))
    .join(', ');

  const returnAnnotation = language === 'typescript' ? `: ${sig.returnType}` : '';

  return `function ${sig.name}(${params})${returnAnnotation} {\n  // TODO: Implement your solution here\n}`;
}

/**
 * Generates a read-only preamble (type definitions / imports) for the
 * given language. This content is displayed to the user as context but
 * is not editable.
 */
export function generateProvidedCode(
  _sig: AICoreOutput['functionSignature'],
  language: 'javascript' | 'typescript',
): string {
  if (language === 'typescript') {
    return `// Type definitions for this problem\n// Do not modify this section`;
  }
  return `// Problem setup\n// Do not modify this section`;
}

/**
 * Assembles a complete, schema-validated `RichProblem` from AI-generated
 * core output and a target language.
 *
 * Steps:
 *  1. Resolve category config (parser + validator + helperCategory)
 *  2. Fetch category helpers (TreeNode, ListNode, etc.)
 *  3. Generate starterCode from functionSignature
 *  4. Generate providedCode preamble
 *  5. Derive legacy boilerplate = providedCode + helperFunctions + starterCode
 *  6. Build executionConfig
 *  7. Compose the full object
 *  8. Validate with RichProblemSchema.parse() (throws ZodError on invalid)
 */
export function assembleProblem(
  core: AICoreOutput,
  language: 'javascript' | 'typescript' = 'javascript',
): RichProblem {
  // 1. Resolve category mapping
  const categoryConfig = resolveCategoryConfig(core.category, core.tags);

  // 2. Get helper code for the detected category
  const helperFunctions = getCategoryHelpers(categoryConfig.detectedCategory, language);

  // 3. Generate starterCode from function signature
  const starterCode = generateStarterCode(core.functionSignature, language);

  // 4. Build providedCode (type definitions / imports)
  const providedCode = generateProvidedCode(core.functionSignature, language);

  // 5. Derive legacy boilerplate
  const boilerplate = [providedCode, helperFunctions, starterCode]
    .filter(Boolean)
    .join('\n\n');

  // 6. Build executionConfig
  const executionConfig = {
    entryFunction: core.functionSignature.name,
    language,
    timeoutMs: 5000,
    memoryLimitMb: 256,
  };

  // 7. Assemble the full RichProblem
  const richProblem = {
    ...core,
    starterCode,
    providedCode,
    helperFunctions,
    parser: { inputType: categoryConfig.parserInputType },
    validator: { strategy: categoryConfig.validatorStrategy },
    executionConfig,
    boilerplate,
  };

  // 8. Validate via Zod (throws ZodError if invalid)
  return RichProblemSchema.parse(richProblem);
}
