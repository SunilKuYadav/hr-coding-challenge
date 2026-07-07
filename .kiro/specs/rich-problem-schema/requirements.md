# Requirements Document

## Introduction

The Rich Problem Schema replaces the flat `GeneratedProblem` type (which carries a single `boilerplate: string` field) with a structured, multi-part schema that separates platform code from user-editable code, defines function signatures as data, supports category-specific helpers and parsers, and enables flexible validation strategies beyond `deepEqual`. The schema is defined using Zod with inferred TypeScript types, validated at the API boundary, and adapted to the existing execution worker contract through a non-breaking shim layer.

## Glossary

- **Schema_Module**: The Zod-based module that defines and exports the `RichProblemSchema` validator and its inferred TypeScript type.
- **Assembly_Layer**: The deterministic post-AI layer that combines AI-generated core problem data with category-derived providedCode, helperFunctions, parser config, and validator selection.
- **Execution_Adapter**: The shim layer that maps a rich problem schema instance into the format expected by the existing execution worker (a `solution` function evaluated via `Function` constructor with test cases compared by a selected validator).
- **Code_Editor**: The Monaco-based editor component that renders starterCode as editable and providedCode as read-only context.
- **Problem_Generator**: The API route and AI prompt pipeline that produces structured problem JSON from user requests.
- **Validation_Service**: The Zod `.parse()` / `.safeParse()` call that replaces the manual `validateGeneratedProblem` function.
- **Worker**: The existing Web Worker (`executionWorker.ts`) that executes user code in a sandbox and compares outputs.

## Requirements

### Requirement 1: Zod Schema Definition

**User Story:** As a developer, I want the problem schema defined with Zod so that runtime validation is type-safe, composable, and replaces manual validation code.

#### Acceptance Criteria

1. THE Schema_Module SHALL export a Zod schema named `RichProblemSchema` that validates all fields of the rich problem structure including starterCode, providedCode, helperFunctions, functionSignature, parser, validator, executionConfig, interviewMetadata, and hints.
2. THE Schema_Module SHALL export a TypeScript type `RichProblem` inferred from `RichProblemSchema` using `z.infer`.
3. THE Schema_Module SHALL define `functionSignature` as an object containing `name` (string), `parameters` (array of objects with `name` and `type` fields), and `returnType` (string).
4. THE Schema_Module SHALL define `parser` as an object containing `inputType` constrained to an enum of known categories including binary-tree, linked-list, matrix, graph, array, and string.
5. THE Schema_Module SHALL define `validator` as an object containing `strategy` constrained to an enum of known comparators including deepEqual, linkedListEqual, treeEqual, unorderedArrayEqual, and floatEqual.
6. THE Schema_Module SHALL define `executionConfig` as an object containing `entryFunction` (string), `language` (enum of javascript or typescript), `timeoutMs` (positive number), and `memoryLimitMb` (positive number).
7. THE Schema_Module SHALL define `hints` as an array of objects each containing `level` (number 1-4) and `content` (string).
8. THE Schema_Module SHALL define `interviewMetadata` as an object containing `expectedPatterns` (string array), `followUpTopics` (string array), `commonMistakes` (string array), and `optimizationQuestions` (string array).

### Requirement 2: Code Separation

**User Story:** As a user, I want my editable solution code separated from read-only platform code so that I can focus on writing the solution without accidentally modifying helpers or test harness.

#### Acceptance Criteria

1. THE Schema_Module SHALL define `starterCode` as a required string field representing the editable user solution template.
2. THE Schema_Module SHALL define `providedCode` as a required string field representing read-only platform code including imports, type definitions, and test harness scaffolding.
3. THE Schema_Module SHALL define `helperFunctions` as a required string field containing category-specific utility code for data structures such as TreeNode, ListNode, or Graph adjacency builders.
4. WHEN the Code_Editor renders a rich problem, THE Code_Editor SHALL display `starterCode` in an editable region and `providedCode` concatenated with `helperFunctions` in a read-only region visible to the user.
5. THE Schema_Module SHALL maintain backward compatibility by continuing to include a `boilerplate` field derived from the concatenation of providedCode, helperFunctions, and starterCode.

### Requirement 3: Deterministic Assembly Layer

**User Story:** As a developer, I want post-AI assembly to deterministically produce providedCode, helperFunctions, parser, and validator based on problem category so that the AI only generates core problem content while platform concerns are consistent and testable.

#### Acceptance Criteria

1. WHEN the Problem_Generator receives AI-generated core problem data, THE Assembly_Layer SHALL select helperFunctions based on the detected problem category.
2. WHEN the problem category maps to a data structure category (Trees, Graphs, LinkedLists, Matrices), THE Assembly_Layer SHALL inject the corresponding parser configuration with the appropriate `inputType` value.
3. WHEN the problem category maps to a data structure category, THE Assembly_Layer SHALL select the corresponding validator strategy (treeEqual for Trees, linkedListEqual for LinkedLists, deepEqual as default).
4. THE Assembly_Layer SHALL produce a complete `RichProblem` instance that passes `RichProblemSchema.parse()` without throwing.
5. WHEN the problem category does not map to a known data structure category, THE Assembly_Layer SHALL use `array` as the default parser inputType and `deepEqual` as the default validator strategy.

### Requirement 4: Execution Adapter

**User Story:** As a developer, I want a non-breaking adapter that maps the rich schema to the existing worker contract so that the execution engine continues to function without modification.

#### Acceptance Criteria

1. THE Execution_Adapter SHALL accept a `RichProblem` instance and user-submitted code string and produce a `WorkerRequest` compatible with the existing Worker message interface.
2. WHEN assembling the executable code payload, THE Execution_Adapter SHALL concatenate providedCode, helperFunctions, and user code in that order so that dependencies are available before user code executes.
3. THE Execution_Adapter SHALL map `executionConfig.entryFunction` to the function name the Worker expects to invoke (currently `solution`).
4. THE Execution_Adapter SHALL select the comparison function indicated by `validator.strategy` and make the selected comparator available to the Worker for result comparison.
5. IF the validator strategy is not `deepEqual`, THEN THE Execution_Adapter SHALL inject the comparator implementation into the Worker code payload so the Worker can use the selected comparison function.
6. THE Execution_Adapter SHALL pass `executionConfig.timeoutMs` and `executionConfig.memoryLimitMb` to the Worker execution context.

### Requirement 5: Schema Validation at API Boundary

**User Story:** As a developer, I want AI-generated problem JSON validated via Zod at the API boundary so that malformed responses are caught before reaching the client.

#### Acceptance Criteria

1. WHEN the Problem_Generator receives a response from the AI model, THE Validation_Service SHALL validate the assembled rich problem using `RichProblemSchema.safeParse()`.
2. IF `RichProblemSchema.safeParse()` returns a failure result, THEN THE Problem_Generator SHALL return an HTTP 502 response with a structured error containing the Zod validation issues.
3. WHEN validation succeeds, THE Problem_Generator SHALL return the validated `RichProblem` object to the client.
4. THE Validation_Service SHALL replace the existing manual `validateGeneratedProblem` function entirely.

### Requirement 6: Function Signature Structure

**User Story:** As a user, I want a structured function signature so that the editor can provide autocompletion hints and the system can generate precise starter code.

#### Acceptance Criteria

1. THE Schema_Module SHALL require `functionSignature.name` to be a non-empty string matching a valid JavaScript identifier pattern.
2. THE Schema_Module SHALL require each parameter in `functionSignature.parameters` to contain `name` (valid identifier string) and `type` (string describing the expected type).
3. THE Assembly_Layer SHALL use `functionSignature` to generate the `starterCode` template with the correct function name, parameter names, and a return type comment.
4. THE Execution_Adapter SHALL use `functionSignature.name` as the `entryFunction` when the worker invokes user code.

### Requirement 7: Category-Specific Helpers

**User Story:** As a user working on tree or linked-list problems, I want pre-built data structure helpers automatically included so that I can focus on the algorithm rather than boilerplate setup.

#### Acceptance Criteria

1. WHEN the problem category is "Trees" or contains tree-related tags, THE Assembly_Layer SHALL include a `TreeNode` class definition and tree-construction utilities in `helperFunctions`.
2. WHEN the problem category is "Linked Lists" or contains linked-list-related tags, THE Assembly_Layer SHALL include a `ListNode` class definition and list-construction utilities in `helperFunctions`.
3. WHEN the problem category is "Graphs" or contains graph-related tags, THE Assembly_Layer SHALL include adjacency list builder utilities in `helperFunctions`.
4. WHEN the problem category is "Matrices" or contains matrix-related tags, THE Assembly_Layer SHALL include matrix parsing and display utilities in `helperFunctions`.
5. THE Assembly_Layer SHALL include the helperFunctions content in the `providedCode` block visible to the user as read-only context.

### Requirement 8: Pre-Generated Hints

**User Story:** As a user, I want leveled hints pre-generated with the problem so that hint delivery is instant without requiring additional AI calls.

#### Acceptance Criteria

1. THE Schema_Module SHALL require the `hints` array to contain between 1 and 4 hint objects.
2. THE Schema_Module SHALL require each hint object to have a `level` field with value between 1 and 4 inclusive and a `content` field with a non-empty string.
3. WHEN the user requests a hint at a given level, THE Code_Editor SHALL retrieve the pre-generated hint from the `hints` array matching the requested level without making an additional API call.
4. IF a hint at the requested level does not exist in the pre-generated hints array, THEN THE Code_Editor SHALL fall back to requesting a hint from the existing AI hint endpoint.

### Requirement 9: Interview Metadata

**User Story:** As a developer, I want structured interview metadata embedded in the problem so that follow-up discussions, evaluation, and scoring can reference expected patterns and common mistakes.

#### Acceptance Criteria

1. THE Schema_Module SHALL require `interviewMetadata.expectedPatterns` to contain at least 1 string describing algorithm patterns the solution should demonstrate.
2. THE Schema_Module SHALL require `interviewMetadata.followUpTopics` to contain at least 1 string describing topics for post-submission discussion.
3. THE Schema_Module SHALL require `interviewMetadata.commonMistakes` to contain at least 1 string describing frequent implementation errors for the problem.
4. THE Schema_Module SHALL require `interviewMetadata.optimizationQuestions` to contain at least 1 string containing questions about solution optimization.
5. WHEN the evaluation phase begins, THE Problem_Generator response SHALL include interviewMetadata so that the evaluation and follow-up services can reference expectedPatterns and commonMistakes.

### Requirement 10: Backward Compatibility

**User Story:** As a developer, I want the rich schema to remain compatible with existing consumers so that the migration is incremental and non-breaking.

#### Acceptance Criteria

1. THE Schema_Module SHALL retain all existing `GeneratedProblem` fields (title, difficulty, category, tags, statement, constraints, inputFormat, outputFormat, samples, edgeCases, hiddenTestCases, expectedTimeComplexity, expectedSpaceComplexity, companyTags, boilerplate).
2. THE Assembly_Layer SHALL populate the legacy `boilerplate` field by concatenating providedCode, helperFunctions, and starterCode so that existing consumers relying on `boilerplate` continue to function.
3. WHEN the Zustand store receives a `RichProblem` instance via `setProblem`, THE store SHALL populate both the new structured fields and the legacy `boilerplate` field in state.
4. THE Execution_Adapter SHALL allow the Worker to operate without modification when the validator strategy is `deepEqual` by maintaining the current code execution and comparison flow.
