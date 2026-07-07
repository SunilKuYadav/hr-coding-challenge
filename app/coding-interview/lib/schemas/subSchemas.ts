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
  'binary-tree',
  'linked-list',
  'matrix',
  'graph',
  'array',
  'string',
]);

export const ParserSchema = z.object({
  inputType: ParserInputType,
});

export const ValidatorStrategy = z.enum([
  'deepEqual',
  'linkedListEqual',
  'treeEqual',
  'unorderedArrayEqual',
  'floatEqual',
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
