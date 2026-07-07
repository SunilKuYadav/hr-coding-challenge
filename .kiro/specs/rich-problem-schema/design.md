# Design Document: Rich Problem Schema

## Overview

This design replaces the flat `GeneratedProblem` type with a structured, multi-part schema that separates platform code from user code, defines function signatures as data, supports category-specific helpers, and enables flexible validation strategies. The system uses Zod for runtime validation with inferred TypeScript types, a deterministic assembly layer for post-AI processing, and a non-breaking adapter shim for the existing execution worker.

## Architecture

### High-Level Data Flow

```
┌─────────────┐    ┌──────────────────┐    ┌────────────────┐    ┌──────────────┐
│  AI Model   │───▶│  Assembly Layer   │───▶│ Zod Validation │───▶│ API Response │
│ (core data) │    │ (deterministic)   │    │  (safeParse)   │    │  (200/502)   │
└─────────────┘    └──────────────────┘    └────────────────┘    └──────────────┘
                                                                         │
                                                                         ▼
┌─────────────┐    ┌──────────────────┐    ┌────────────────┐    ┌──────────────┐
│   Worker    │◀───│Execution Adapter  │◀───│  Code Editor   │◀───│ Zustand Store│
│ (unchanged) │    │ (shim layer)      │    │ (read-only +   │    │ (setProblem) │
└─────────────┘    └──────────────────┘    │  editable)     │    └──────────────┘
                                           └────────────────┘
```


### Flow Description

1. **AI Generation**: The AI model generates core problem content (title, statement, samples, test cases, function signature, hints, metadata). It does NOT produce providedCode, helperFunctions, parser, or validator.
2. **Assembly Layer**: Deterministically derives providedCode, helperFunctions, parser config, validator strategy, executionConfig, and boilerplate from the AI output's category and function signature.
3. **Zod Validation**: The assembled `RichProblem` is validated via `RichProblemSchema.safeParse()`. Failures return 502 with structured Zod errors.
4. **API Response**: Validated `RichProblem` is returned to the client.
5. **Client Store**: Zustand store receives the `RichProblem` and populates both new structured fields and legacy `boilerplate` field.
6. **Code Editor**: Renders `starterCode` as editable and `providedCode + helperFunctions` as read-only context.
7. **Execution Adapter**: Maps `RichProblem` + user code into a `WorkerRequest` compatible with the existing worker interface.
8. **Worker**: Executes code unchanged — the adapter handles all translation.

## Components and Interfaces

### Components

| Component | Responsibility | Location |
|-----------|---------------|----------|
| Schema_Module | Zod schema definition + type export | `lib/schemas/` |
| Assembly_Layer | Deterministic post-AI problem assembly | `services/assemblyLayer.ts` |
| Execution_Adapter | Maps RichProblem → WorkerRequest | `services/executionAdapter.ts` |
| Category_Helpers | Per-category code templates | `services/categoryHelpers/` |
| Code_Editor | Read-only + editable region rendering | `components/CodeEditor.tsx` |
| Validation_Service | Zod safeParse at API boundary | Inline in route handler |
| Zustand_Store | State management with backward compat | `store/interviewStore.ts` |

### Key Interfaces

```typescript
// Input to Assembly Layer (from AI)
interface AICoreOutput { /* see Assembly Layer section */ }

// Output of Assembly Layer / API response
type RichProblem = z.infer<typeof RichProblemSchema>;

// Output of Execution Adapter
interface AdapterOutput {
  workerRequest: WorkerRequest;
  timeoutMs: number;
  memoryLimitMb: number;
}

// Existing Worker interface (unchanged)
interface WorkerRequest {
  code: string;
  testCases: Array<{ input: unknown; expectedOutput: unknown }>;
  maxOutputLength: number;
}
```

## Module Design

### File Structure

```
app/coding-interview/
├── lib/
│   ├── types.ts                    # Existing types (unchanged, extended)
│   ├── schemas/
│   │   ├── richProblemSchema.ts    # Zod schema + inferred type
│   │   ├── subSchemas.ts           # Reusable sub-schemas
│   │   └── index.ts               # Barrel export
│   └── constants.ts                # Extended with category maps
├── services/
│   ├── assemblyLayer.ts            # Deterministic assembly
│   ├── executionAdapter.ts         # Rich schema → WorkerRequest
│   ├── executionService.ts         # Existing (unchanged)
│   ├── executionWorker.ts          # Existing (unchanged)
│   └── categoryHelpers/
│       ├── trees.ts                # TreeNode class + utilities
│       ├── linkedLists.ts          # ListNode class + utilities
│       ├── graphs.ts               # Adjacency list builders
│       ├── matrices.ts             # Matrix utilities
│       └── index.ts                # Category registry
└── store/
    └── interviewStore.ts           # Updated setProblem action
```


## Zod Schema Module

### Sub-Schemas (`lib/schemas/subSchemas.ts`)

```typescript
import { z } from 'zod';

// Valid JavaScript identifier regex
const jsIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

export const FunctionParameterSchema = z.object({
  name: z.string().regex(jsIdentifier, 'Must be a valid JS identifier'),
  type: z.string().min(1),
});

export const FunctionSignatureSchema = z.object({
  name: z.string().regex(jsIdentifier, 'Must be a valid JS identifier'),
  parameters: z.array(FunctionParameterSchema).min(1),
  returnType: z.string().min(1),
});

export const ParserInputType = z.enum([
  'binary-tree', 'linked-list', 'matrix', 'graph', 'array', 'string'
]);

export const ParserSchema = z.object({
  inputType: ParserInputType,
});

export const ValidatorStrategy = z.enum([
  'deepEqual', 'linkedListEqual', 'treeEqual', 'unorderedArrayEqual', 'floatEqual'
]);

export const ValidatorSchema = z.object({
  strategy: ValidatorStrategy,
});

export const ExecutionConfigSchema = z.object({
  entryFunction: z.string().regex(jsIdentifier),
  language: z.enum(['javascript', 'typescript']),
  timeoutMs: z.number().positive(),
  memoryLimitMb: z.number().positive(),
});

export const HintSchema = z.object({
  level: z.number().int().min(1).max(4),
  content: z.string().min(1),
});

export const InterviewMetadataSchema = z.object({
  expectedPatterns: z.array(z.string().min(1)).min(1),
  followUpTopics: z.array(z.string().min(1)).min(1),
  commonMistakes: z.array(z.string().min(1)).min(1),
  optimizationQuestions: z.array(z.string().min(1)).min(1),
});
```


### Main Schema (`lib/schemas/richProblemSchema.ts`)

```typescript
import { z } from 'zod';
import {
  FunctionSignatureSchema,
  ParserSchema,
  ValidatorSchema,
  ExecutionConfigSchema,
  HintSchema,
  InterviewMetadataSchema,
} from './subSchemas';

const SampleIOSchema = z.object({
  input: z.string(),
  output: z.string(),
  explanation: z.string(),
});

const EdgeCaseSchema = z.object({
  description: z.string(),
  input: z.string(),
  expectedOutput: z.string(),
});

const TestCaseSchema = z.object({
  input: z.unknown(),
  expectedOutput: z.unknown(),
});

export const RichProblemSchema = z.object({
  // Legacy fields (backward compatible with GeneratedProblem)
  title: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  category: z.string().min(1),
  tags: z.array(z.string()).min(2),
  statement: z.string().min(1),
  constraints: z.array(z.string()),
  inputFormat: z.string().min(1),
  outputFormat: z.string().min(1),
  samples: z.array(SampleIOSchema).min(2),
  edgeCases: z.array(EdgeCaseSchema).min(2),
  hiddenTestCases: z.array(TestCaseSchema).min(5),
  expectedTimeComplexity: z.string().min(1),
  expectedSpaceComplexity: z.string().min(1),
  companyTags: z.array(z.string()).min(1).max(5),
  boilerplate: z.string().min(1),

  // New rich fields
  starterCode: z.string().min(1),
  providedCode: z.string(),
  helperFunctions: z.string(),
  functionSignature: FunctionSignatureSchema,
  parser: ParserSchema,
  validator: ValidatorSchema,
  executionConfig: ExecutionConfigSchema,
  hints: z.array(HintSchema).min(1).max(4),
  interviewMetadata: InterviewMetadataSchema,
});

export type RichProblem = z.infer<typeof RichProblemSchema>;
```


## Assembly Layer Design

### Category-to-Helper Mapping (`services/assemblyLayer.ts`)

```typescript
import { RichProblemSchema, type RichProblem } from '../lib/schemas';
import { getCategoryHelpers } from './categoryHelpers';

// Maps problem categories/tags to data structure types
const CATEGORY_MAP: Record<string, {
  parserInputType: ParserInputType;
  validatorStrategy: ValidatorStrategy;
}> = {
  'Trees':        { parserInputType: 'binary-tree', validatorStrategy: 'treeEqual' },
  'Binary Trees': { parserInputType: 'binary-tree', validatorStrategy: 'treeEqual' },
  'Linked Lists': { parserInputType: 'linked-list', validatorStrategy: 'linkedListEqual' },
  'Graphs':       { parserInputType: 'graph',       validatorStrategy: 'deepEqual' },
  'Matrices':     { parserInputType: 'matrix',      validatorStrategy: 'deepEqual' },
};

const DEFAULT_PARSER = { inputType: 'array' as const };
const DEFAULT_VALIDATOR = { strategy: 'deepEqual' as const };

interface AICoreOutput {
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
```


### Assembly Function

```typescript
export function assembleProblem(
  core: AICoreOutput,
  language: 'javascript' | 'typescript' = 'javascript'
): RichProblem {
  // 1. Resolve category mapping
  const categoryConfig = resolveCategoryConfig(core.category, core.tags);

  // 2. Get helper code for the detected category
  const helperFunctions = getCategoryHelpers(categoryConfig.detectedCategory, language);

  // 3. Generate starterCode from function signature
  const starterCode = generateStarterCode(core.functionSignature, language);

  // 4. Build providedCode (type definitions, imports)
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
  const richProblem: RichProblem = {
    ...core,
    starterCode,
    providedCode,
    helperFunctions,
    parser: { inputType: categoryConfig.parserInputType },
    validator: { strategy: categoryConfig.validatorStrategy },
    executionConfig,
    boilerplate,
  };

  // 8. Validate via Zod (throws if invalid)
  return RichProblemSchema.parse(richProblem);
}

function resolveCategoryConfig(category: string, tags: string[]) {
  // Direct category match
  if (CATEGORY_MAP[category]) {
    return { ...CATEGORY_MAP[category], detectedCategory: category };
  }

  // Tag-based detection
  for (const tag of tags) {
    for (const [cat, config] of Object.entries(CATEGORY_MAP)) {
      if (tag.toLowerCase().includes(cat.toLowerCase())) {
        return { ...config, detectedCategory: cat };
      }
    }
  }

  // Default fallback
  return {
    ...DEFAULT_PARSER,
    ...DEFAULT_VALIDATOR,
    parserInputType: DEFAULT_PARSER.inputType,
    validatorStrategy: DEFAULT_VALIDATOR.strategy,
    detectedCategory: 'default',
  };
}
```


### Starter Code Generation

```typescript
function generateStarterCode(
  sig: AICoreOutput['functionSignature'],
  language: 'javascript' | 'typescript'
): string {
  const params = sig.parameters
    .map(p => language === 'typescript' ? `${p.name}: ${p.type}` : p.name)
    .join(', ');

  const returnAnnotation = language === 'typescript' ? `: ${sig.returnType}` : '';

  return `function ${sig.name}(${params})${returnAnnotation} {
  // TODO: Implement your solution here
}`;
}

function generateProvidedCode(
  sig: AICoreOutput['functionSignature'],
  language: 'javascript' | 'typescript'
): string {
  if (language === 'typescript') {
    return `// Type definitions for this problem
// Do not modify this section`;
  }
  return `// Problem setup
// Do not modify this section`;
}
```

### Category Helpers Registry (`services/categoryHelpers/index.ts`)

```typescript
import { TREE_HELPERS } from './trees';
import { LINKED_LIST_HELPERS } from './linkedLists';
import { GRAPH_HELPERS } from './graphs';
import { MATRIX_HELPERS } from './matrices';

const HELPER_REGISTRY: Record<string, string> = {
  'Trees': TREE_HELPERS,
  'Binary Trees': TREE_HELPERS,
  'Linked Lists': LINKED_LIST_HELPERS,
  'Graphs': GRAPH_HELPERS,
  'Matrices': MATRIX_HELPERS,
};

export function getCategoryHelpers(category: string, _language: string): string {
  return HELPER_REGISTRY[category] ?? '';
}
```


## Execution Adapter Design

### Interface (`services/executionAdapter.ts`)

The adapter maps `RichProblem` + user code into the `WorkerRequest` interface expected by `executionWorker.ts`, without modifying the worker itself.

```typescript
import type { RichProblem } from '../lib/schemas';

interface WorkerRequest {
  code: string;
  testCases: Array<{ input: unknown; expectedOutput: unknown }>;
  maxOutputLength: number;
}

interface AdapterOutput {
  workerRequest: WorkerRequest;
  timeoutMs: number;
  memoryLimitMb: number;
}

// Comparator implementations for non-deepEqual strategies
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
```


### Adapter Function

```typescript
export function adaptForWorker(
  problem: RichProblem,
  userCode: string
): AdapterOutput {
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

  // 3. Map entryFunction to 'solution' (worker expects `solution` function)
  const entryFn = executionConfig.entryFunction;
  if (entryFn !== 'solution') {
    codeParts.push(`\nvar solution = ${entryFn};`);
  }

  const code = codeParts.join('\n\n');

  // 4. Build WorkerRequest
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
```

### Key Design Decisions

1. **Non-breaking**: The worker's `self.onmessage` handler and `WorkerRequest` interface remain unchanged. All adaptation happens before posting to the worker.
2. **Comparator injection**: For non-deepEqual strategies, the comparator code is injected into the code string. The existing `deepEqual` import in the worker is used as-is when strategy is `deepEqual`.
3. **Entry function aliasing**: If the function signature names the entry function something other than `solution`, a simple `var solution = fnName;` alias is appended.
4. **Concatenation order**: `providedCode → helperFunctions → userCode` ensures dependencies (class definitions, utility functions) are available before user code references them.


## Code Editor Integration

### Updated Editor Behavior

The existing `CodeEditor` component (CodeMirror-based) will be enhanced to support a split view:

```typescript
interface RichCodeEditorProps {
  starterCode: string;
  providedCode: string;
  helperFunctions: string;
  onChange: (userCode: string) => void;
  language: 'javascript' | 'typescript';
  readOnly?: boolean;
}
```

### Read-Only vs Editable Regions

The editor renders two logical sections:

1. **Read-only context** (top): `providedCode + helperFunctions` — displayed with a muted background and `EditorState.readOnly.of(true)`. Provides class definitions and helper utilities as visible context.
2. **Editable region** (bottom): `starterCode` — the user's working area where they implement the solution.

### Implementation Approach

Rather than splitting into two CodeMirror instances (which complicates scrolling and UX), the editor uses CodeMirror's `EditorState.changeFilter` to prevent modifications in the read-only range:

```typescript
// Calculate read-only boundary
const readOnlyContent = [providedCode, helperFunctions].filter(Boolean).join('\n\n');
const readOnlyLength = readOnlyContent.length;

// Change filter prevents edits in the read-only region
const readOnlyFilter = EditorState.changeFilter.of((tr) => {
  // Block changes that touch the read-only region (chars 0..readOnlyLength)
  for (const change of tr.changes.iterChanges()) {
    if (change[0] < readOnlyLength) return false;
  }
  return true;
});
```

### Reset Behavior

When the user clicks "Reset", only the editable region resets to `starterCode`. The read-only region is immutable.

### Backward Compatibility

The existing `CodeEditorProps` interface continues to work. The enhanced component detects whether it receives a `RichProblem`-style split or a legacy `boilerplate` string and renders accordingly.


## API Route Changes

### Updated `generate-problem/route.ts`

```typescript
import { assembleProblem } from '@/app/coding-interview/services/assemblyLayer';
import { RichProblemSchema } from '@/app/coding-interview/lib/schemas';

// In POST handler, after AI response parsing:
// 1. Parse AI core output (title, statement, samples, etc.)
// 2. Call assembleProblem(coreOutput, language) to produce RichProblem
// 3. Validate with RichProblemSchema.safeParse()
// 4. Return validated result or 502 with Zod issues

export async function POST(request: NextRequest) {
  // ... existing request validation ...

  // After parsing AI JSON response:
  const parseResult = RichProblemSchema.safeParse(assembled);

  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: 'AI response does not match required problem structure',
        issues: parseResult.error.issues,
      },
      { status: 502 }
    );
  }

  return NextResponse.json(parseResult.data);
}
```

The manual `validateGeneratedProblem` function is removed entirely.

## Store Integration

### Updated `setProblem` Action

```typescript
setProblem: (problem: RichProblem) =>
  set({
    problem,
    // Legacy fields for backward compat
    boilerplate: problem.boilerplate,
    code: problem.starterCode, // User starts editing starterCode only
  }),
```

The store type for `problem` changes from `GeneratedProblem | null` to `RichProblem | null`. Since `RichProblem` is a superset of `GeneratedProblem` (it includes all legacy fields), existing consumers that read `problem.title`, `problem.samples`, etc. continue working.


## Backward Compatibility Strategy

### Principles

1. **Superset schema**: `RichProblem` extends `GeneratedProblem` — all legacy fields are retained.
2. **Derived boilerplate**: The `boilerplate` field is derived from `providedCode + helperFunctions + starterCode`, so consumers that only read `boilerplate` see no change.
3. **Worker unchanged**: The execution worker's message interface is unchanged. The adapter handles all translation.
4. **Store backward compat**: `setProblem` populates both `problem` (new structured fields) and `boilerplate` (legacy flat string).
5. **Incremental migration**: Components can be migrated one at a time to use rich fields. Until migrated, they use `boilerplate`.

### Migration Path

| Component | Before | After |
|-----------|--------|-------|
| CodeEditor | Reads `boilerplate` | Reads `starterCode` + `providedCode` + `helperFunctions` |
| useCodeExecution | Sends `code` to worker | Calls `adaptForWorker(problem, code)` then sends |
| HintPanel | Calls AI endpoint | Reads `problem.hints[level]`, falls back to AI |
| EvaluationPanel | No metadata | Reads `problem.interviewMetadata` |
| API route | Manual validation | `RichProblemSchema.safeParse()` |

## Error Handling

### Validation Errors

When `RichProblemSchema.safeParse()` fails, the API returns:

```json
{
  "error": "AI response does not match required problem structure",
  "issues": [
    { "path": ["hints", 0, "level"], "message": "Number must be >= 1" },
    { "path": ["functionSignature", "name"], "message": "Invalid" }
  ]
}
```

### Assembly Layer Errors

If the AI output is missing required fields for assembly (e.g., no `functionSignature`), the assembly layer throws a descriptive error that the route catches and returns as a 502.

### Adapter Errors

The adapter is a pure function — it cannot fail if given a valid `RichProblem`. Invalid problems are caught upstream at the validation boundary.


## Data Models

### AI Core Output (what AI generates)

| Field | Type | Description |
|-------|------|-------------|
| title | string | Problem title |
| difficulty | enum | easy, medium, hard |
| category | string | Algorithm category |
| tags | string[] (min 2) | Relevant tags |
| statement | string | Full problem description |
| constraints | string[] | Input constraints |
| inputFormat | string | Input format description |
| outputFormat | string | Output format description |
| samples | SampleIO[] (min 2) | Example inputs/outputs |
| edgeCases | EdgeCase[] (min 2) | Edge case descriptions |
| hiddenTestCases | TestCase[] (min 5) | Hidden test cases |
| expectedTimeComplexity | string | Big-O time |
| expectedSpaceComplexity | string | Big-O space |
| companyTags | string[] (1-5) | Company associations |
| functionSignature | FunctionSignature | Structured signature |
| hints | Hint[] (1-4) | Pre-generated hints |
| interviewMetadata | InterviewMetadata | Follow-up context |

### Assembly Layer Output (derived fields)

| Field | Type | Source |
|-------|------|--------|
| starterCode | string | Generated from functionSignature |
| providedCode | string | Generated from language + signature |
| helperFunctions | string | Looked up from category registry |
| parser | { inputType } | Mapped from category |
| validator | { strategy } | Mapped from category |
| executionConfig | ExecutionConfig | Derived from signature + defaults |
| boilerplate | string | Concatenation of providedCode + helperFunctions + starterCode |


## Testing Strategy

### Property-Based Tests (via fast-check)

The core logic modules (schema, assembly layer, adapter) are pure functions with well-defined input/output contracts — ideal for property-based testing:

1. **Schema validation**: Generate random valid/invalid objects, verify parse/reject behavior.
2. **Assembly layer**: Generate random categories + AI core outputs, verify correct mapping.
3. **Execution adapter**: Generate random RichProblem + user code, verify WorkerRequest structure.

### Unit Tests

- Example-based tests for specific category mappings (Trees → treeEqual, etc.)
- Edge cases for identifier validation regex
- API route integration with mock AI responses (valid and invalid)
- Store `setProblem` populates both rich and legacy fields

### Integration Tests

- End-to-end flow: mock AI response → assembly → validation → adapter → worker execution
- Code editor renders read-only and editable regions correctly

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Schema validates well-formed data and rejects malformed data

*For any* object that contains all required fields with correct types, valid enums, arrays within length bounds, positive numbers where required, and identifier-pattern strings where required, `RichProblemSchema.parse()` SHALL succeed. *For any* object that violates any single constraint (missing field, wrong enum value, empty required array, non-positive number, invalid identifier), `RichProblemSchema.parse()` SHALL throw a `ZodError`.

**Validates: Requirements 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 6.1, 6.2, 8.1, 8.2, 9.1, 9.2, 9.3, 9.4**

### Property 2: Assembly layer produces correct category mapping

*For any* problem category and tag set, the assembly layer SHALL produce a `parser.inputType` and `validator.strategy` that matches the defined CATEGORY_MAP when the category is a known data structure type, and SHALL default to `{ inputType: 'array', strategy: 'deepEqual' }` when the category is unknown. Additionally, `helperFunctions` SHALL contain the expected class/utility definitions for the resolved category (TreeNode for trees, ListNode for linked lists, adjacency builders for graphs, matrix utilities for matrices) and SHALL be empty string for unknown categories.

**Validates: Requirements 3.1, 3.2, 3.3, 3.5, 7.1, 7.2, 7.3, 7.4**

### Property 3: Assembly output is always schema-valid

*For any* valid AI core output (containing all required AI-generated fields with correct types), the `assembleProblem()` function SHALL produce an object that passes `RichProblemSchema.parse()` without throwing.

**Validates: Requirements 3.4, 5.1**

### Property 4: Boilerplate derivation is deterministic concatenation

*For any* valid `RichProblem` instance, the `boilerplate` field SHALL equal the concatenation of `providedCode`, `helperFunctions`, and `starterCode` (joined by double newlines, filtered for empty strings). This ensures backward-compatible consumers receive the same content they would have received from the legacy schema.

**Validates: Requirements 2.5, 10.1, 10.2**

### Property 5: Execution adapter produces correct WorkerRequest

*For any* valid `RichProblem` and *any* non-empty user code string, `adaptForWorker()` SHALL produce a `WorkerRequest` where: (a) the `code` field starts with `providedCode`, followed by `helperFunctions`, followed by user code; (b) if `validator.strategy` is not `deepEqual`, the code contains the corresponding comparator implementation; (c) if `executionConfig.entryFunction` is not `'solution'`, the code contains an alias `var solution = <entryFunction>;`; (d) `testCases` equals `problem.hiddenTestCases`; (e) when strategy is `deepEqual`, the output is byte-for-byte compatible with the current WorkerRequest format.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 6.4, 10.4**

### Property 6: Starter code reflects function signature

*For any* valid `functionSignature` containing a name and at least one parameter, the generated `starterCode` SHALL contain the function name as a declaration, all parameter names from the signature, and a TODO comment indicating where to implement the solution.

**Validates: Requirements 6.3**
