# Bugfix Requirements Document

## Introduction

The `generate-problem` API route produces a `GeneratedProblem` schema that only includes a single flat `boilerplate` string field for code generation. This is insufficient to power the editor (which needs read-only platform code vs editable starter code), the execution engine (which needs parser/validator/entry point info), the hint system (which needs pre-generated leveled hints), and the AI interviewer (which needs structured interview metadata like expected patterns and follow-up topics). The result is that downstream consumers must parse or guess information that should be explicitly structured in the schema.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a problem is generated for a category requiring helper data structures (Trees, Graphs, Linked Lists) THEN the system returns only a flat `boilerplate` string with no structured helper types, imports, or test harness code

1.2 WHEN the execution engine receives a generated problem THEN the system provides no parser specification telling the runtime how to deserialize inputs (e.g., array-to-tree conversion) and no validator specification for comparing outputs (deepEqual vs treeEqual vs linkedListEqual)

1.3 WHEN the execution engine needs to run user code THEN the system provides no execution configuration (entry function name, language, timeout limits, memory limits), forcing consumers to infer or hardcode these values

1.4 WHEN the editor loads a generated problem THEN the system provides a single `boilerplate` string with no separation between platform-provided read-only code (helpers, types, harness) and user-editable starter code

1.5 WHEN the editor or execution engine needs the function signature THEN the system buries it inside the `boilerplate` string rather than providing it as a structured field with name, parameters, and return type

1.6 WHEN the AI interviewer needs to conduct the interview THEN the system provides no structured interview metadata (expected algorithmic patterns, follow-up discussion topics, common candidate mistakes, optimization questions)

1.7 WHEN the hint system is triggered THEN the system has no pre-generated hints bundled with the problem, requiring a separate API call and losing the problem-generation context

1.8 WHEN a problem is generated for a specific category THEN the system provides no explicit data structure definitions tied to that category (e.g., TreeNode for Trees, ListNode for Linked Lists, GraphNode for Graphs)

### Expected Behavior (Correct)

2.1 WHEN a problem is generated for a category requiring helper data structures THEN the system SHALL return a `providedCode` object containing `language`, `imports`, `types`, `helpers`, and `testHarness` fields that supply category-appropriate platform code

2.2 WHEN the execution engine receives a generated problem THEN the system SHALL include a `parser` object with `inputType` (e.g., "array", "matrix", "adjacencyList") and `helper` (e.g., "buildBinaryTree", "buildLinkedList") fields, and a `validator` field specifying the comparison strategy (e.g., "deepEqual", "treeEqual", "linkedListEqual", "unorderedEqual")

2.3 WHEN the execution engine needs to run user code THEN the system SHALL include an `execution` object with `entry` (function name), `language`, `timeout` (ms), and `memory` (MB) fields

2.4 WHEN the editor loads a generated problem THEN the system SHALL provide a `starterCode` string field containing only the user-editable solution template, separate from `providedCode` which is read-only

2.5 WHEN the editor or execution engine needs the function signature THEN the system SHALL provide a `functionSignature` object with `name`, `parameters` (array of {name, type}), and `returnType` fields

2.6 WHEN the AI interviewer needs to conduct the interview THEN the system SHALL include an `interview` object with `expectedPatterns` (array), `followUpTopics` (array), `commonMistakes` (array), and `optimizationQuestions` (array) fields

2.7 WHEN the hint system is triggered THEN the system SHALL include a `hints` array of leveled hint objects (each with `level` number and `content` string) pre-generated alongside the problem

2.8 WHEN a problem is generated for a specific category THEN the system SHALL include a `dataStructures` array containing category-aware type definitions (e.g., `{ name: "TreeNode", definition: "..." }`) relevant to the problem

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a problem is generated THEN the system SHALL CONTINUE TO return `title`, `difficulty`, `category`, `tags`, `statement`, `constraints`, `inputFormat`, `outputFormat`, `samples`, `edgeCases`, `hiddenTestCases`, `expectedTimeComplexity`, `expectedSpaceComplexity`, and `companyTags` fields with the same structure and validation rules

3.2 WHEN the request body is missing the required `source` field THEN the system SHALL CONTINUE TO return a 400 error with message "Missing required field: source"

3.3 WHEN the request body contains an invalid `source` value THEN the system SHALL CONTINUE TO return a 400 error with the invalid source identified

3.4 WHEN the request body contains an invalid `difficulty` value THEN the system SHALL CONTINUE TO return a 400 error with the invalid difficulty identified

3.5 WHEN the request body contains an invalid `language` value THEN the system SHALL CONTINUE TO return a 400 error with the invalid language identified

3.6 WHEN the AI response cannot be parsed as JSON THEN the system SHALL CONTINUE TO return a 502 error with message "Failed to parse AI response as valid JSON"

3.7 WHEN the AI response does not match the required problem structure THEN the system SHALL CONTINUE TO return a 502 error with message "AI response does not match required problem structure"

3.8 WHEN problem generation exceeds the timeout THEN the system SHALL CONTINUE TO return a 504 error with timeout message

3.9 WHEN generating a problem with a user-provided prompt, problem context, topic context, or revision context THEN the system SHALL CONTINUE TO include appropriate context in the AI prompt

3.10 WHEN generating a problem THEN the system SHALL CONTINUE TO require at least 2 tags, 2 samples, 2 edge cases, 5 hidden test cases, and 1-5 company tags
