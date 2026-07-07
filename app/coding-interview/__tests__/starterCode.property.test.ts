import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { generateStarterCode } from '../services/assemblyLayer';

/** Escape a string for safe use inside a RegExp */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Property-based tests for starter code generation.
 *
 * **Validates: Requirements 6.3**
 */

// ── Arbitraries ────────────────────────────────────────────────────────────

/**
 * Valid JavaScript identifier.
 * Matches /^[a-zA-Z_$][a-zA-Z0-9_$]*$/ with a max length to keep runs fast.
 */
const arbJsIdentifier: fc.Arbitrary<string> = fc
  .stringMatching(/^[a-zA-Z_$][a-zA-Z0-9_$]{0,19}$/)
  .filter((s) => s.length >= 1);

/** Non-empty type annotation string (e.g. "number", "string[]", "TreeNode") */
const arbTypeString: fc.Arbitrary<string> = fc.string({ minLength: 1, maxLength: 30 });

/** A single function parameter */
const arbParameter = fc.record({
  name: arbJsIdentifier,
  type: arbTypeString,
});

/** A valid function signature with at least one parameter */
const arbFunctionSignature = fc.record({
  name: arbJsIdentifier,
  parameters: fc.array(arbParameter, { minLength: 1, maxLength: 6 }),
  returnType: arbTypeString,
});

const arbLanguage = fc.constantFrom('javascript' as const, 'typescript' as const);

// ── Property 6 ─────────────────────────────────────────────────────────────

describe('Property 6: Starter code reflects function signature', () => {
  it('generated starterCode contains the function name for both languages', () => {
    fc.assert(
      fc.property(arbFunctionSignature, arbLanguage, (sig, language) => {
        const code = generateStarterCode(sig, language);
        expect(code).toContain(sig.name);
      }),
      { numRuns: 200 },
    );
  });

  it('generated starterCode contains all parameter names for both languages', () => {
    fc.assert(
      fc.property(arbFunctionSignature, arbLanguage, (sig, language) => {
        const code = generateStarterCode(sig, language);
        for (const param of sig.parameters) {
          expect(code).toContain(param.name);
        }
      }),
      { numRuns: 200 },
    );
  });

  it('generated starterCode contains a TODO comment for both languages', () => {
    fc.assert(
      fc.property(arbFunctionSignature, arbLanguage, (sig, language) => {
        const code = generateStarterCode(sig, language);
        expect(code).toContain('// TODO');
      }),
      { numRuns: 200 },
    );
  });

  describe('JavaScript-specific properties', () => {
    it('starterCode starts with "function <name>(" for JavaScript', () => {
      fc.assert(
        fc.property(arbFunctionSignature, (sig) => {
          const code = generateStarterCode(sig, 'javascript');
          // Escape sig.name so special chars like $ don't break the regex
          expect(code).toMatch(new RegExp(`^function ${escapeRegex(sig.name)}\\(`));
        }),
        { numRuns: 200 },
      );
    });

    it('JavaScript starterCode does NOT contain type annotations (": type") in the parameter list', () => {
      fc.assert(
        fc.property(arbFunctionSignature, (sig) => {
          const code = generateStarterCode(sig, 'javascript');
          // Extract the parameter list: everything between the first ( and )
          // Use a non-greedy match; function name may contain $ so avoid \w+
          const parenStart = code.indexOf('(');
          const parenEnd = code.indexOf(')');
          expect(parenStart).toBeGreaterThan(-1);
          expect(parenEnd).toBeGreaterThan(parenStart);
          const paramList = code.slice(parenStart + 1, parenEnd);
          // No colon should appear in the JS parameter list
          expect(paramList).not.toContain(':');
        }),
        { numRuns: 200 },
      );
    });
  });

  describe('TypeScript-specific properties', () => {
    it('starterCode contains type annotations for each parameter in TypeScript', () => {
      fc.assert(
        fc.property(arbFunctionSignature, (sig) => {
          const code = generateStarterCode(sig, 'typescript');
          for (const param of sig.parameters) {
            // Each param should appear as "name: type" in the generated code
            expect(code).toContain(`${param.name}: ${param.type}`);
          }
        }),
        { numRuns: 200 },
      );
    });

    it('starterCode contains return type annotation in TypeScript', () => {
      fc.assert(
        fc.property(arbFunctionSignature, (sig) => {
          const code = generateStarterCode(sig, 'typescript');
          // Return type annotation appears as "): returnType {"
          expect(code).toContain(`: ${sig.returnType}`);
        }),
        { numRuns: 200 },
      );
    });

    it('TypeScript starterCode declares function with name and curly braces', () => {
      fc.assert(
        fc.property(arbFunctionSignature, (sig) => {
          const code = generateStarterCode(sig, 'typescript');
          // Escape sig.name so special chars like $ don't break the regex
          expect(code).toMatch(new RegExp(`^function ${escapeRegex(sig.name)}\\(`));
          expect(code).toContain('{');
          expect(code).toContain('}');
        }),
        { numRuns: 200 },
      );
    });
  });
});
