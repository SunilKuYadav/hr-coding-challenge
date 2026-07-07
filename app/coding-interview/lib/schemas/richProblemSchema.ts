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
