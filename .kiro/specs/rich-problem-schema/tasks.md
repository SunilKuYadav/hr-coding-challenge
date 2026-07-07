# Implementation Plan: Rich Problem Schema

## Overview

Replace the flat `GeneratedProblem` type with a structured, Zod-validated `RichProblem` schema. Implementation proceeds bottom-up: schema definitions first, then assembly layer, execution adapter, API route integration, client-side store/editor updates, and finally wiring everything together.

## Tasks

- [x] 1. Define Zod sub-schemas and main RichProblemSchema
  - [x] 1.1 Create sub-schemas module (`lib/schemas/subSchemas.ts`)
    - Create `app/coding-interview/lib/schemas/subSchemas.ts`
    - Define and export `FunctionParameterSchema`, `FunctionSignatureSchema`, `ParserSchema` (with `ParserInputType` enum), `ValidatorSchema` (with `ValidatorStrategy` enum), `ExecutionConfigSchema`, `HintSchema`, and `InterviewMetadataSchema`
    - Use `z.string().regex()` for JS identifier validation on `functionSignature.name` and parameter names
    - Constrain `hints.level` to 1–4, all arrays to min lengths per requirements
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 6.1, 6.2, 8.1, 8.2, 9.1, 9.2, 9.3, 9.4_

  - [x] 1.2 Create main schema module (`lib/schemas/richProblemSchema.ts`)
    - Create `app/coding-interview/lib/schemas/richProblemSchema.ts`
    - Define `SampleIOSchema`, `EdgeCaseSchema`, `TestCaseSchema` inline
    - Define and export `RichProblemSchema` combining all legacy `GeneratedProblem` fields with new rich fields (`starterCode`, `providedCode`, `helperFunctions`, `functionSignature`, `parser`, `validator`, `executionConfig`, `hints`, `interviewMetadata`)
    - Export inferred type `RichProblem` via `z.infer<typeof RichProblemSchema>`
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 10.1_

  - [x] 1.3 Create barrel export (`lib/schemas/index.ts`)
    - Create `app/coding-interview/lib/schemas/index.ts` re-exporting all schemas and types
    - _Requirements: 1.1_

  - [x] 1.4 Write property test for schema validation (Property 1)
    - **Property 1: Schema validates well-formed data and rejects malformed data**
    - Use `fast-check` to generate arbitrary valid objects conforming to all field constraints; assert `RichProblemSchema.parse()` succeeds
    - Generate objects with single-field violations (missing fields, wrong enums, empty arrays, non-positive numbers, invalid identifiers); assert `RichProblemSchema.parse()` throws `ZodError`
    - **Validates: Requirements 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 6.1, 6.2, 8.1, 8.2, 9.1, 9.2, 9.3, 9.4**

- [x] 2. Implement category helpers registry
  - [x] 2.1 Create tree helpers (`services/categoryHelpers/trees.ts`)
    - Create `app/coding-interview/services/categoryHelpers/trees.ts`
    - Export `TREE_HELPERS` string constant containing `TreeNode` class definition and tree-construction utilities (e.g., `buildTree` from array)
    - _Requirements: 7.1_

  - [x] 2.2 Create linked list helpers (`services/categoryHelpers/linkedLists.ts`)
    - Create `app/coding-interview/services/categoryHelpers/linkedLists.ts`
    - Export `LINKED_LIST_HELPERS` string constant containing `ListNode` class and list-construction utilities
    - _Requirements: 7.2_

  - [x] 2.3 Create graph helpers (`services/categoryHelpers/graphs.ts`)
    - Create `app/coding-interview/services/categoryHelpers/graphs.ts`
    - Export `GRAPH_HELPERS` string constant with adjacency list builder utilities
    - _Requirements: 7.3_

  - [x] 2.4 Create matrix helpers (`services/categoryHelpers/matrices.ts`)
    - Create `app/coding-interview/services/categoryHelpers/matrices.ts`
    - Export `MATRIX_HELPERS` string constant with matrix parsing/display utilities
    - _Requirements: 7.4_

  - [x] 2.5 Create category registry (`services/categoryHelpers/index.ts`)
    - Create `app/coding-interview/services/categoryHelpers/index.ts`
    - Import all helper constants and export `getCategoryHelpers(category, language)` function
    - Return matching helper string or empty string for unknown categories
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 3. Implement assembly layer
  - [x] 3.1 Create assembly layer service (`services/assemblyLayer.ts`)
    - Create `app/coding-interview/services/assemblyLayer.ts`
    - Define `AICoreOutput` interface for AI-generated fields
    - Define `CATEGORY_MAP` for category → parser/validator mapping
    - Implement `resolveCategoryConfig()` with direct match, tag-based fallback, and default (`array`/`deepEqual`)
    - Implement `generateStarterCode()` using `functionSignature` to produce the function template
    - Implement `generateProvidedCode()` for language-specific preamble
    - Implement `assembleProblem(core, language)` that orchestrates: resolve category → get helpers → generate starterCode → generate providedCode → derive boilerplate → build executionConfig → validate with `RichProblemSchema.parse()`
    - _Requirements: 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 6.3, 10.2_

  - [x] 3.2 Write property test for category mapping (Property 2)
    - **Property 2: Assembly layer produces correct category mapping**
    - Use `fast-check` to generate arbitrary categories/tags from known set → assert correct parser/validator
    - Generate unknown categories → assert defaults to `array`/`deepEqual`
    - Assert `helperFunctions` contains expected class definitions for known categories
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.5, 7.1, 7.2, 7.3, 7.4**

  - [x] 3.3 Write property test for assembly output validity (Property 3)
    - **Property 3: Assembly output is always schema-valid**
    - Use `fast-check` to generate valid `AICoreOutput` objects, call `assembleProblem()`, assert no `ZodError` thrown
    - **Validates: Requirements 3.4, 5.1**

  - [x] 3.4 Write property test for boilerplate derivation (Property 4)
    - **Property 4: Boilerplate derivation is deterministic concatenation**
    - For any valid `RichProblem`, assert `boilerplate === [providedCode, helperFunctions, starterCode].filter(Boolean).join('\n\n')`
    - **Validates: Requirements 2.5, 10.1, 10.2**

  - [x] 3.5 Write property test for starter code generation (Property 6)
    - **Property 6: Starter code reflects function signature**
    - Generate arbitrary valid function signatures; assert generated starterCode contains function name, all parameter names, and TODO comment
    - **Validates: Requirements 6.3**

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement execution adapter
  - [x] 5.1 Create execution adapter (`services/executionAdapter.ts`)
    - Create `app/coding-interview/services/executionAdapter.ts`
    - Define `AdapterOutput` interface (`workerRequest`, `timeoutMs`, `memoryLimitMb`)
    - Define `COMPARATOR_CODE` record with implementations for `treeEqual`, `linkedListEqual`, `unorderedArrayEqual`, `floatEqual`
    - Implement `adaptForWorker(problem, userCode)`: concatenate code in order (providedCode → helperFunctions → userCode), inject comparator for non-deepEqual strategies, alias entry function to `solution` if different, return `AdapterOutput`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 10.4_

  - [x] 5.2 Write property test for execution adapter (Property 5)
    - **Property 5: Execution adapter produces correct WorkerRequest**
    - Use `fast-check` to generate valid `RichProblem` + user code; assert code ordering, comparator injection, entry function aliasing, testCases mapping, and deepEqual backward-compatibility
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 6.4, 10.4**

- [x] 6. Integrate schema validation into API route
  - [x] 6.1 Update `generate-problem/route.ts` to use assembly layer and Zod validation
    - Modify `app/api/ai/coding-interview/generate-problem/route.ts`
    - Import `assembleProblem` from assembly layer and `RichProblemSchema` from schemas
    - After AI response parsing, call `assembleProblem(coreOutput, 'javascript')` to produce `RichProblem`
    - Validate assembled result with `RichProblemSchema.safeParse()`; return 502 with Zod issues on failure
    - Return validated `RichProblem` on success
    - Remove usage of manual `validateGeneratedProblem` function
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 6.2 Write unit tests for API route validation
    - Test with valid mock AI response → assert 200 with valid `RichProblem`
    - Test with malformed AI response → assert 502 with structured error issues
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 7. Update Zustand store and client hooks
  - [x] 7.1 Update interview store (`store/interviewStore.ts`)
    - Import `RichProblem` type from schemas
    - Change `problem` state type from `GeneratedProblem | null` to `RichProblem | null`
    - Update `setProblem` action to populate both `problem` (structured fields) and `boilerplate` (legacy) and `code` (starterCode)
    - _Requirements: 10.3_

  - [x] 7.2 Update `useCodeExecution` hook to use execution adapter
    - Modify `app/coding-interview/hooks/useCodeExecution.ts`
    - Import `adaptForWorker` from execution adapter
    - When running code, call `adaptForWorker(problem, userCode)` to produce `WorkerRequest` instead of constructing it manually
    - Pass `timeoutMs` and `memoryLimitMb` from adapter output to worker execution
    - _Requirements: 4.1, 4.6_

  - [x] 7.3 Update HintPanel to use pre-generated hints
    - Modify `app/coding-interview/components/HintPanel.tsx`
    - When a hint is requested, first check `problem.hints` for a matching `level`
    - If found, display the pre-generated hint content immediately without API call
    - If not found, fall back to existing AI hint endpoint
    - _Requirements: 8.3, 8.4_

- [x] 8. Update Code Editor for read-only regions
  - [x] 8.1 Enhance CodeEditor component for split view
    - Modify `app/coding-interview/components/CodeEditor.tsx`
    - Accept new props: `starterCode`, `providedCode`, `helperFunctions` (alongside existing `value`/`onChange`)
    - When rich props are provided: render `providedCode + helperFunctions` as read-only region at top, `starterCode` as editable region below
    - Implement CodeMirror `EditorState.changeFilter` to prevent edits in the read-only character range
    - Style the read-only region with a muted background to visually distinguish it
    - On reset, restore only the editable region to `starterCode`
    - Maintain backward compatibility: if only `value` is provided (legacy mode), render as before
    - _Requirements: 2.4, 10.3_

  - [x] 8.2 Write unit tests for CodeEditor read-only behavior
    - Test that changes in read-only region are rejected
    - Test that editable region accepts changes
    - Test reset restores only editable region
    - Test backward compatibility with legacy props
    - _Requirements: 2.4_

- [x] 9. Final integration and wiring
  - [x] 9.1 Wire InterviewModule to pass rich problem data to CodeEditor
    - Update `app/coding-interview/InterviewModule.tsx` to read `starterCode`, `providedCode`, `helperFunctions` from store and pass to CodeEditor
    - Ensure `onChange` callback only updates the user's editable code in the store
    - _Requirements: 2.4, 10.3_

  - [x] 9.2 Remove legacy `validateGeneratedProblem` function
    - Delete or deprecate the manual validation logic in `app/coding-interview/lib/validation.ts`
    - Remove any imports of the old validation function across the codebase
    - _Requirements: 5.4_

  - [x] 9.3 Write integration tests for end-to-end flow
    - Test: mock AI response → assembly → validation → adapter → WorkerRequest structure
    - Test: store receives RichProblem → both rich fields and legacy boilerplate populated
    - _Requirements: 3.4, 10.2, 10.3, 10.4_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The worker (`executionWorker.ts`) is never modified — all adaptation happens in the adapter layer
- TypeScript is the implementation language (matching the existing Next.js/TypeScript project)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "2.2", "2.3", "2.4"] },
    { "id": 1, "tasks": ["1.2", "2.5"] },
    { "id": 2, "tasks": ["1.3", "1.4"] },
    { "id": 3, "tasks": ["3.1"] },
    { "id": 4, "tasks": ["3.2", "3.3", "3.4", "3.5", "5.1"] },
    { "id": 5, "tasks": ["5.2", "6.1"] },
    { "id": 6, "tasks": ["6.2", "7.1"] },
    { "id": 7, "tasks": ["7.2", "7.3", "8.1"] },
    { "id": 8, "tasks": ["8.2", "9.1"] },
    { "id": 9, "tasks": ["9.2", "9.3"] }
  ]
}
```
