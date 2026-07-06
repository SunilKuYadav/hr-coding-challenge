# Enhanced Problem Schema Bugfix Design

## Overview

The `generate-problem` API route currently returns a `GeneratedProblem` with a single flat `boilerplate` string. This forces downstream consumers (editor, execution engine, hint system, AI interviewer) to parse or guess structured information that should be explicit in the schema. The fix replaces `boilerplate` with a set of structured fields—`providedCode`, `starterCode`, `functionSignature`, `dataStructures`, `parser`, `validator`, `execution`, `interview`, and `hints`—so each consumer receives exactly the data it needs without ambiguity.

## Glossary

- **Bug_Condition (C)**: Any generated problem response that contains only a flat `boilerplate` string instead of the structured fields required by the editor, execution engine, hint system, and AI interviewer
- **Property (P)**: The response SHALL include all structured sub-objects (`providedCode`, `starterCode`, `functionSignature`, `dataStructures`, `parser`, `validator`, `execution`, `interview`, `hints`) with correct types and constraints
- **Preservation**: All existing fields (`title`, `difficulty`, `category`, `tags`, `statement`, `constraints`, `inputFormat`, `outputFormat`, `samples`, `edgeCases`, `hiddenTestCases`, `expectedTimeComplexity`, `expectedSpaceComplexity`, `companyTags`) and all error-handling behaviors (400/502/504 responses) must remain unchanged
- **GeneratedProblem**: The TypeScript interface in `app/coding-interview/lib/types.ts` that defines the shape of the API response
- **providedCode**: Read-only platform code supplied to the editor (imports, types, helpers, test harness)
- **starterCode**: The editable user solution template shown in the editor
- **functionSignature**: Structured representation of the solution function's name, parameters, and return type
- **parser**: Specification telling the runtime how to deserialize test inputs (e.g., array-to-tree)
- **validator**: The comparison strategy for checking outputs (deepEqual, treeEqual, etc.)
- **execution**: Runtime configuration (entry function, language, timeout, memory)
- **interview**: Metadata for the AI interviewer (patterns, topics, mistakes, optimization questions)
- **hints**: Pre-generated leveled hint array bundled with the problem

## Bug Details

### Bug Condition

The bug manifests when the `generate-problem` route returns a response. The `GeneratedProblem` schema defines only a `boilerplate: string` field for all code-related content, providing no structured data for the editor (read-only vs editable separation), execution engine (parser, validator, entry point, limits), hint system (leveled hints), or AI interviewer (expected patterns, follow-ups, mistakes).

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type GenerateProblemRequest (valid source, optional context/language/difficulty)
  OUTPUT: boolean

  response := generateProblem(input)
  RETURN response.hasField("boilerplate")
         AND NOT response.hasField("providedCode")
         AND NOT response.hasField("starterCode")
         AND NOT response.hasField("functionSignature")
         AND NOT response.hasField("dataStructures")
         AND NOT response.hasField("parser")
         AND NOT response.hasField("validator")
         AND NOT response.hasField("execution")
         AND NOT response.hasField("interview")
         AND NOT response.hasField("hints")
END FUNCTION
```

### Examples

- **Trees category, TypeScript**: Request `{ source: "topic", context: { source: "topic", id: "1", title: "Binary Trees", concepts: ["DFS","BFS"] }, language: "typescript", difficulty: "medium" }` → Currently returns `boilerplate: "function inorderTraversal(root: TreeNode | null): number[] { // TODO }"` with no TreeNode definition, no parser for array→tree conversion, no treeEqual validator
- **Arrays category, JavaScript**: Request `{ source: "self-test", language: "javascript", difficulty: "easy" }` → Currently returns `boilerplate: "function twoSum(nums, target) { // TODO }"` with no function signature object, no execution config, no hints
- **Graphs category, medium difficulty**: Request `{ source: "practice", difficulty: "medium" }` → Currently returns `boilerplate: "function shortestPath(graph, start, end) { // TODO }"` with no adjacencyList parser, no GraphNode data structure, no interview metadata
- **Linked Lists category with interview context**: Request `{ source: "interview", difficulty: "hard" }` → Currently returns `boilerplate: "function reverseKGroup(head, k) { // TODO }"` with no ListNode type, no linkedListEqual validator, no expectedPatterns for the AI interviewer

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- All existing `GeneratedProblem` fields (`title`, `difficulty`, `category`, `tags`, `statement`, `constraints`, `inputFormat`, `outputFormat`, `samples`, `edgeCases`, `hiddenTestCases`, `expectedTimeComplexity`, `expectedSpaceComplexity`, `companyTags`) must continue to be returned with the same structure and validation rules
- Request validation must continue to return 400 errors for missing `source`, invalid `source`, invalid `difficulty`, and invalid `language`
- JSON parse failures must continue to return 502 with "Failed to parse AI response as valid JSON"
- Schema validation failures must continue to return 502 with "AI response does not match required problem structure"
- Timeout must continue to return 504 with timeout message
- AI prompt context injection (userPrompt, problem context, topic context, revision context) must continue to work
- Minimum counts (2 tags, 2 samples, 2 edge cases, 5 hidden test cases, 1-5 company tags) must continue to be enforced

**Scope:**
All inputs that produce error responses (400, 502, 504, 500) should be completely unaffected by this fix. The fix only changes the successful (200) response shape by replacing `boilerplate` with structured fields.

## Hypothesized Root Cause

Based on the bug analysis, the root cause is a schema design limitation rather than a runtime defect:

1. **Flat Schema Design**: The original `GeneratedProblem` interface was designed with a single `boilerplate: string` field, treating all code-related content as an opaque string. This was likely adequate for an MVP but insufficient once multiple consumers (editor, execution engine, hint system, AI interviewer) needed distinct structured data.

2. **Prompt Does Not Request Structured Output**: The `buildProblemGenerationPrompt` function instructs the AI to return `"boilerplate": "string - starter code..."` rather than requesting the structured sub-objects. Even if the TypeScript types were updated, the AI would still return a flat string.

3. **Validator Only Checks `boilerplate` Existence**: The `validateGeneratedProblem` function checks that `boilerplate` is a non-empty string but has no validation logic for the new structured fields. After the schema change, this validator must be updated to check the new fields.

4. **Type Definitions Lack Sub-Interfaces**: The `types.ts` file defines `GeneratedProblem` with `boilerplate: string` but has no interfaces for `ProvidedCode`, `FunctionSignature`, `Parser`, `Execution`, `Interview`, or `Hint`. These must be added.

## Correctness Properties

Property 1: Bug Condition - Structured Fields Present in Response

_For any_ valid `GenerateProblemRequest` that produces a successful (200) response, the fixed `generate-problem` route SHALL return a response containing `providedCode` (object with `language`, `imports`, `types`, `helpers`, `testHarness`), `starterCode` (string), `functionSignature` (object with `name`, `parameters`, `returnType`), `dataStructures` (array), `parser` (object with `inputType`, `helper`), `validator` (string), `execution` (object with `entry`, `language`, `timeout`, `memory`), `interview` (object with `expectedPatterns`, `followUpTopics`, `commonMistakes`, `optimizationQuestions`), and `hints` (array of leveled objects), instead of a flat `boilerplate` string.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8**

Property 2: Preservation - Existing Fields and Error Behavior Unchanged

_For any_ request to the `generate-problem` route, the fixed code SHALL produce the same error responses (400, 502, 504, 500) with the same messages and status codes as the original code, and for successful responses SHALL continue to include all original fields (`title`, `difficulty`, `category`, `tags`, `statement`, `constraints`, `inputFormat`, `outputFormat`, `samples`, `edgeCases`, `hiddenTestCases`, `expectedTimeComplexity`, `expectedSpaceComplexity`, `companyTags`) with the same structure and validation rules.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `app/coding-interview/lib/types.ts`

**Changes**:
1. **Add sub-interfaces**: Define `ProvidedCode`, `FunctionParameter`, `FunctionSignature`, `DataStructureDefinition`, `Parser`, `ExecutionConfig`, `InterviewMetadata`, and `Hint` interfaces
2. **Update `GeneratedProblem`**: Remove `boilerplate: string` and add `providedCode`, `starterCode`, `functionSignature`, `dataStructures`, `parser`, `validator`, `execution`, `interview`, and `hints` fields with their respective types

**File**: `app/api/ai/coding-interview/generate-problem/route.ts`

**Function**: `buildProblemGenerationPrompt`

**Changes**:
3. **Update prompt JSON schema**: Replace the `"boilerplate"` field in the prompt with the full structured schema for all new fields, including nested object descriptions and constraints
4. **Add field-specific requirements**: Add prompt instructions for minimum array lengths (hints ≥ 1), required sub-fields, and category-aware data structure generation

**Function**: `validateGeneratedProblem`

**Changes**:
5. **Remove `boilerplate` validation**: Remove `'boilerplate'` from the `requiredStrings` array
6. **Add `starterCode` validation**: Validate `starterCode` is a non-empty string
7. **Add `providedCode` validation**: Validate it is an object with `language` (string), `imports` (string array), `types` (string array), `helpers` (string array), `testHarness` (string)
8. **Add `functionSignature` validation**: Validate it is an object with `name` (string), `parameters` (array of `{name, type}`), `returnType` (string)
9. **Add `dataStructures` validation**: Validate it is an array of objects with `name` (string) and `definition` (string)
10. **Add `parser` validation**: Validate it is an object with `inputType` (string) and `helper` (string)
11. **Add `validator` validation**: Validate it is a non-empty string
12. **Add `execution` validation**: Validate it is an object with `entry` (string), `language` (string), `timeout` (number), `memory` (number)
13. **Add `interview` validation**: Validate it is an object with `expectedPatterns` (string array), `followUpTopics` (string array), `commonMistakes` (string array), `optimizationQuestions` (string array)
14. **Add `hints` validation**: Validate it is an array of objects with `level` (number) and `content` (string)

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code (the flat `boilerplate` response), then verify the fix produces correct structured output and preserves all existing behaviors.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that the current route returns only `boilerplate` and lacks structured fields.

**Test Plan**: Write tests that call the `generate-problem` route with valid requests and assert the presence of structured fields. Run these tests on the UNFIXED code to observe failures and confirm the schema deficiency.

**Test Cases**:
1. **Trees Category Test**: Generate a problem for Trees category → assert `providedCode.types` contains TreeNode (will fail on unfixed code)
2. **Execution Config Test**: Generate any problem → assert `execution` object has `entry`, `language`, `timeout`, `memory` (will fail on unfixed code)
3. **Hints Test**: Generate any problem → assert `hints` is a non-empty array of `{level, content}` objects (will fail on unfixed code)
4. **Interview Metadata Test**: Generate any problem → assert `interview` object has all four arrays (will fail on unfixed code)
5. **Starter Code Separation Test**: Generate any problem → assert `starterCode` is a string and `providedCode` is an object (will fail on unfixed code)

**Expected Counterexamples**:
- Response contains `boilerplate` string but no `providedCode`, `starterCode`, `functionSignature`, `dataStructures`, `parser`, `validator`, `execution`, `interview`, or `hints` fields
- Root cause confirmed: schema only defines `boilerplate: string`, prompt only requests `boilerplate`, validator only checks `boilerplate`

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (any valid request producing a 200 response), the fixed function produces a response with all required structured fields.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  response := generateProblem_fixed(input)
  ASSERT response.providedCode IS object WITH keys [language, imports, types, helpers, testHarness]
  ASSERT response.starterCode IS non-empty string
  ASSERT response.functionSignature IS object WITH keys [name, parameters, returnType]
  ASSERT response.dataStructures IS array OF {name, definition}
  ASSERT response.parser IS object WITH keys [inputType, helper]
  ASSERT response.validator IS non-empty string
  ASSERT response.execution IS object WITH keys [entry, language, timeout, memory]
  ASSERT response.interview IS object WITH keys [expectedPatterns, followUpTopics, commonMistakes, optimizationQuestions]
  ASSERT response.hints IS non-empty array OF {level, content}
  ASSERT NOT response.hasField("boilerplate")
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (error responses), the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT generateProblem_original(input) = generateProblem_fixed(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many combinations of invalid inputs automatically
- It catches edge cases in validation logic that manual tests might miss
- It provides strong guarantees that error handling is unchanged

**Test Plan**: Observe behavior on UNFIXED code first for error cases (missing source, invalid source, invalid difficulty, invalid language), then write property-based tests capturing that behavior.

**Test Cases**:
1. **400 Error Preservation**: Verify missing/invalid `source`, `difficulty`, `language` continue to return correct 400 errors with same messages
2. **502 Error Preservation**: Verify malformed AI responses continue to return 502 with same messages
3. **504 Timeout Preservation**: Verify timeout behavior continues to return 504 with same message
4. **Existing Fields Preservation**: Verify successful responses still include all original fields (`title`, `difficulty`, `category`, etc.) with same validation rules (≥2 tags, ≥2 samples, etc.)
5. **Prompt Context Preservation**: Verify that userPrompt, problem context, topic context, and revision context continue to be included in the AI prompt

### Unit Tests

- Test `validateGeneratedProblem` rejects responses missing any new structured field
- Test `validateGeneratedProblem` rejects responses with incorrectly typed sub-fields (e.g., `execution.timeout` as string)
- Test `validateGeneratedProblem` continues to reject responses missing existing fields
- Test `validateGeneratedProblem` accepts a fully valid response with all new and existing fields
- Test `buildProblemGenerationPrompt` output includes instructions for all new structured fields

### Property-Based Tests

- Generate random valid `GenerateProblemRequest` objects and verify the validator accepts correctly shaped responses with all structured fields
- Generate random invalid responses (missing fields, wrong types, empty arrays) and verify the validator rejects them
- Generate random error-triggering inputs (invalid source, invalid difficulty) and verify error responses match original behavior exactly

### Integration Tests

- Test full round-trip: valid request → AI response (mocked) → validated structured response with all fields
- Test that the editor can consume `providedCode` + `starterCode` separation correctly
- Test that the execution engine can read `parser`, `validator`, and `execution` fields
- Test that the hint system can iterate over `hints` array
- Test that the AI interviewer can access `interview` metadata fields
