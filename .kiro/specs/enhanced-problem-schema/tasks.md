# Implementation Plan

## Overview

This task list implements the enhanced problem schema bugfix using the bug condition methodology. The fix replaces the flat `boilerplate` string in `GeneratedProblem` with structured fields (`providedCode`, `starterCode`, `functionSignature`, `dataStructures`, `parser`, `validator`, `execution`, `interview`, `hints`) so each downstream consumer receives exactly the data it needs.

## Tasks

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Flat Boilerplate Schema Returns No Structured Fields
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete cases: any valid `GenerateProblemRequest` (e.g., `{ source: "self-test", language: "javascript", difficulty: "easy" }`) that produces a 200 response
  - Test that `generateProblem(validRequest)` returns a response with `providedCode` (object), `starterCode` (string), `functionSignature` (object), `dataStructures` (array), `parser` (object), `validator` (string), `execution` (object), `interview` (object), and `hints` (array) instead of a flat `boilerplate` string
  - Bug condition from design: `isBugCondition(input)` returns true when response has `boilerplate` but lacks `providedCode`, `starterCode`, `functionSignature`, `dataStructures`, `parser`, `validator`, `execution`, `interview`, `hints`
  - Use `validateGeneratedProblem` to confirm the response passes the enhanced validator (which checks for structured fields)
  - Run test on UNFIXED code - expect FAILURE (this confirms the bug exists)
  - **EXPECTED OUTCOME**: Test FAILS because current response only contains `boilerplate: string` with no structured fields
  - Document counterexamples found (e.g., response contains `boilerplate` but missing `providedCode`, `execution`, `hints`, etc.)
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Error Handling and Existing Field Validation Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - **IMPORTANT**: Write these tests BEFORE implementing the fix
  - Observe on UNFIXED code: `POST /api/ai/coding-interview/generate-problem` with missing `source` returns 400 `{ error: "Missing required field: source" }`
  - Observe on UNFIXED code: `POST` with `{ source: "invalid" }` returns 400 `{ error: "Invalid source: invalid" }`
  - Observe on UNFIXED code: `POST` with `{ source: "self-test", difficulty: "extreme" }` returns 400 `{ error: "Invalid difficulty: extreme" }`
  - Observe on UNFIXED code: `POST` with `{ source: "self-test", language: "python" }` returns 400 `{ error: "Invalid language: python" }`
  - Observe on UNFIXED code: AI returning unparseable text produces 502 `{ error: "Failed to parse AI response as valid JSON" }`
  - Observe on UNFIXED code: AI returning valid JSON missing required fields produces 502 `{ error: "AI response does not match required problem structure" }`
  - Write property-based tests: for all invalid source values, response is 400 with correct error message
  - Write property-based tests: for all invalid difficulty values, response is 400 with correct error message
  - Write property-based tests: for all invalid language values, response is 400 with correct error message
  - Write property-based tests: for all malformed AI JSON responses, response is 502 with correct error message
  - Write unit tests: `validateGeneratedProblem` continues to reject responses missing existing fields (`title`, `difficulty`, `category`, `tags`, `samples`, etc.)
  - Write unit tests: `validateGeneratedProblem` continues to enforce minimum counts (≥2 tags, ≥2 samples, ≥2 edge cases, ≥5 hidden test cases, 1-5 company tags)
  - Verify all preservation tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [x] 3. Fix for enhanced problem schema - replace flat boilerplate with structured fields

  - [x] 3.1 Add sub-interfaces to `app/coding-interview/lib/types.ts`
    - Add `ProvidedCode` interface with fields: `language` (string), `imports` (string[]), `types` (string[]), `helpers` (string[]), `testHarness` (string)
    - Add `FunctionParameter` interface with fields: `name` (string), `type` (string)
    - Add `FunctionSignature` interface with fields: `name` (string), `parameters` (FunctionParameter[]), `returnType` (string)
    - Add `DataStructureDefinition` interface with fields: `name` (string), `definition` (string)
    - Add `Parser` interface with fields: `inputType` (string), `helper` (string)
    - Add `ExecutionConfig` interface with fields: `entry` (string), `language` (string), `timeout` (number), `memory` (number)
    - Add `InterviewMetadata` interface with fields: `expectedPatterns` (string[]), `followUpTopics` (string[]), `commonMistakes` (string[]), `optimizationQuestions` (string[])
    - Add `Hint` interface with fields: `level` (number), `content` (string)
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 2.8_

  - [x] 3.2 Update `GeneratedProblem` interface in `app/coding-interview/lib/types.ts`
    - Remove `boilerplate: string` field
    - Add `providedCode: ProvidedCode` field
    - Add `starterCode: string` field
    - Add `functionSignature: FunctionSignature` field
    - Add `dataStructures: DataStructureDefinition[]` field
    - Add `parser: Parser` field
    - Add `validator: string` field
    - Add `execution: ExecutionConfig` field
    - Add `interview: InterviewMetadata` field
    - Add `hints: Hint[]` field
    - _Bug_Condition: isBugCondition(input) where response has `boilerplate` but no structured fields_
    - _Expected_Behavior: Response includes all structured sub-objects instead of flat boilerplate_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 3.3 Update `buildProblemGenerationPrompt` in `app/api/ai/coding-interview/generate-problem/route.ts`
    - Replace `"boilerplate"` field in the JSON schema with the full structured schema for all new fields
    - Add nested object descriptions for `providedCode`, `functionSignature`, `parser`, `execution`, `interview`
    - Add requirements for `hints` (array of `{level, content}` objects, at least 1 hint)
    - Add requirements for `dataStructures` (array of `{name, definition}` objects, category-aware)
    - Add requirement for `starterCode` (editable solution template string)
    - Add requirement for `validator` (comparison strategy string)
    - Preserve all existing prompt context injection (userPrompt, problem context, topic context, revision context)
    - _Bug_Condition: Prompt only requests flat `boilerplate` string_
    - _Expected_Behavior: Prompt requests all structured sub-objects with correct types and constraints_
    - _Preservation: Context injection (userPrompt, problem, topic, revision) unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.9_

  - [x] 3.4 Update `validateGeneratedProblem` in `app/api/ai/coding-interview/generate-problem/route.ts`
    - Remove `'boilerplate'` from the `requiredStrings` array
    - Add `starterCode` validation: non-empty string
    - Add `providedCode` validation: object with `language` (string), `imports` (string[]), `types` (string[]), `helpers` (string[]), `testHarness` (string)
    - Add `functionSignature` validation: object with `name` (string), `parameters` (array of `{name, type}`), `returnType` (string)
    - Add `dataStructures` validation: array of objects with `name` (string) and `definition` (string)
    - Add `parser` validation: object with `inputType` (string) and `helper` (string)
    - Add `validator` validation: non-empty string
    - Add `execution` validation: object with `entry` (string), `language` (string), `timeout` (number), `memory` (number)
    - Add `interview` validation: object with `expectedPatterns` (string[]), `followUpTopics` (string[]), `commonMistakes` (string[]), `optimizationQuestions` (string[])
    - Add `hints` validation: non-empty array of objects with `level` (number) and `content` (string)
    - Preserve all existing validation logic for original fields (tags ≥ 2, samples ≥ 2, edgeCases ≥ 2, hiddenTestCases ≥ 5, companyTags 1-5)
    - _Bug_Condition: Validator only checks `boilerplate` existence_
    - _Expected_Behavior: Validator checks all new structured fields with correct types_
    - _Preservation: Existing field validation unchanged (minimum counts, required strings, structure checks)_
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.1, 3.7, 3.10_

  - [x] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Structured Fields Present in Response
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior (response contains structured fields)
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed - response now has structured fields instead of flat boilerplate)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Error Handling and Existing Fields Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all error handling (400, 502, 504) still works identically
    - Confirm all existing fields still validated with same rules
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run full test suite to confirm no regressions
  - Verify bug condition exploration test passes (structured fields present)
  - Verify preservation tests pass (error handling and existing fields unchanged)
  - Verify any existing tests in `app/coding-interview/__tests__/` still pass
  - Ensure all tests pass, ask the user if questions arise.


## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1", "2"] },
    { "id": 1, "tasks": ["3.1"] },
    { "id": 2, "tasks": ["3.2"] },
    { "id": 3, "tasks": ["3.3", "3.4"] },
    { "id": 4, "tasks": ["3.5"] },
    { "id": 5, "tasks": ["3.6"] },
    { "id": 6, "tasks": ["4"] }
  ]
}
```

## Notes

- Tasks 1 and 2 MUST be completed BEFORE task 3 (they run on unfixed code)
- Tasks 1 and 2 can be done in parallel
- Task 3.1 must precede 3.2 (interfaces needed before updating GeneratedProblem)
- Tasks 3.3 and 3.4 can be done in parallel after 3.2
- Tasks 3.5 and 3.6 re-run existing tests (do NOT write new tests)
- The exploration test (task 1) is expected to FAIL on unfixed code - this is correct behavior
- The preservation tests (task 2) are expected to PASS on unfixed code - this confirms baseline
