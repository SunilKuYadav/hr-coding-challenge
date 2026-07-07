import { describe, it, expect } from 'vitest';

/**
 * Unit tests for CodeEditor read-only behavior logic.
 *
 * Since CodeMirror requires a DOM environment and no DOM testing library
 * is installed in the project, we test the LOGIC that drives the CodeEditor:
 * - Rich mode detection
 * - Read-only boundary computation
 * - Change filter decision logic (accept/reject edits based on position)
 * - Reset behavior (only editable region resets)
 * - onChange emission (only emits the editable portion)
 * - Backward compatibility with legacy props
 *
 * These functions mirror the exact logic used inside CodeEditor.tsx.
 *
 * **Validates: Requirements 2.4**
 */

/* ─── Extracted logic from CodeEditor (mirrors component internals) ─── */

interface CodeEditorLogicInput {
  value: string;
  starterCode?: string;
  providedCode?: string;
  helperFunctions?: string;
  boilerplate: string;
}

/**
 * Determines if the editor should be in rich mode (split view) or legacy mode.
 */
function isRichMode(props: CodeEditorLogicInput): boolean {
  return props.starterCode !== undefined && (props.providedCode !== undefined || props.helperFunctions !== undefined);
}

/**
 * Computes the read-only content displayed at the top of the editor.
 */
function computeReadOnlyContent(props: CodeEditorLogicInput): string {
  if (!isRichMode(props)) return '';
  return [props.providedCode, props.helperFunctions].filter(Boolean).join('\n\n');
}

/**
 * Computes the separator between read-only and editable regions.
 */
function computeSeparator(props: CodeEditorLogicInput): string {
  const readOnlyContent = computeReadOnlyContent(props);
  return readOnlyContent && props.starterCode ? '\n\n' : '';
}

/**
 * Computes the boundary index. Characters before this index are read-only.
 */
function computeReadOnlyBoundary(props: CodeEditorLogicInput): number {
  const readOnlyContent = computeReadOnlyContent(props);
  const separator = computeSeparator(props);
  return readOnlyContent.length + separator.length;
}

/**
 * Simulates the change filter logic:
 * Returns true if the change should be ALLOWED (passes the filter).
 * Returns false if the change should be BLOCKED (in read-only region).
 *
 * The logic mirrors EditorState.changeFilter behavior in CodeEditor.tsx:
 * - If any change touches a position before the read-only boundary, block it.
 */
function shouldAllowChange(readOnlyBoundary: number, changes: Array<{ from: number; to: number }>): boolean {
  let dominated = false;
  for (const change of changes) {
    if (change.from < readOnlyBoundary || change.to < readOnlyBoundary) {
      dominated = true;
      break;
    }
  }
  return !dominated;
}

/**
 * Computes the full document content in rich mode.
 */
function computeFullDocument(props: CodeEditorLogicInput): string {
  const readOnlyContent = computeReadOnlyContent(props);
  const separator = computeSeparator(props);
  return readOnlyContent + separator + props.value;
}

/**
 * Extracts the editable content from a full document in rich mode.
 * This is what onChange emits to the parent.
 */
function extractEditableContent(fullDoc: string, readOnlyBoundary: number): string {
  return fullDoc.slice(readOnlyBoundary);
}

/**
 * Computes the value emitted on reset in rich mode.
 */
function computeResetValue(props: CodeEditorLogicInput): string {
  if (isRichMode(props)) {
    return props.starterCode ?? '';
  }
  return props.boilerplate;
}

/* ─── Tests ──────────────────────────────────────────────── */

describe('CodeEditor read-only behavior logic', () => {
  const richProps: CodeEditorLogicInput = {
    value: 'function solve(root) {\n  // TODO\n}',
    starterCode: 'function solve(root) {\n  // TODO\n}',
    providedCode: '// Type definitions\n// Do not modify this section',
    helperFunctions: 'class TreeNode {\n  constructor(val) {\n    this.val = val;\n    this.left = null;\n    this.right = null;\n  }\n}',
    boilerplate: '',
  };

  const legacyProps: CodeEditorLogicInput = {
    value: 'function solve() {\n  return 42;\n}',
    boilerplate: 'function solve() {\n  // starter\n}',
  };

  describe('mode detection', () => {
    it('should be in rich mode when starterCode and providedCode are provided', () => {
      expect(isRichMode(richProps)).toBe(true);
    });

    it('should be in rich mode when starterCode and helperFunctions are provided', () => {
      const props: CodeEditorLogicInput = {
        value: 'code',
        starterCode: 'function fn() {}',
        helperFunctions: 'class Node {}',
        boilerplate: '',
      };
      expect(isRichMode(props)).toBe(true);
    });

    it('should be in rich mode when all rich props are provided', () => {
      expect(isRichMode(richProps)).toBe(true);
    });

    it('should be in legacy mode when only value is provided', () => {
      expect(isRichMode(legacyProps)).toBe(false);
    });

    it('should be in legacy mode when starterCode is undefined', () => {
      const props: CodeEditorLogicInput = {
        value: 'code',
        providedCode: 'some code',
        boilerplate: '',
      };
      expect(isRichMode(props)).toBe(false);
    });

    it('should be in legacy mode when neither providedCode nor helperFunctions are provided', () => {
      const props: CodeEditorLogicInput = {
        value: 'code',
        starterCode: 'function fn() {}',
        boilerplate: '',
      };
      expect(isRichMode(props)).toBe(false);
    });
  });

  describe('read-only boundary computation', () => {
    it('should compute correct read-only content from providedCode and helperFunctions', () => {
      const content = computeReadOnlyContent(richProps);
      expect(content).toBe(
        '// Type definitions\n// Do not modify this section\n\nclass TreeNode {\n  constructor(val) {\n    this.val = val;\n    this.left = null;\n    this.right = null;\n  }\n}'
      );
    });

    it('should use only providedCode when helperFunctions is empty', () => {
      const props: CodeEditorLogicInput = {
        value: 'code',
        starterCode: 'function fn() {}',
        providedCode: '// platform code',
        helperFunctions: '',
        boilerplate: '',
      };
      const content = computeReadOnlyContent(props);
      expect(content).toBe('// platform code');
    });

    it('should use only helperFunctions when providedCode is empty', () => {
      const props: CodeEditorLogicInput = {
        value: 'code',
        starterCode: 'function fn() {}',
        providedCode: '',
        helperFunctions: 'class ListNode {}',
        boilerplate: '',
      };
      const content = computeReadOnlyContent(props);
      expect(content).toBe('class ListNode {}');
    });

    it('should include separator in boundary when both read-only content and starterCode exist', () => {
      const boundary = computeReadOnlyBoundary(richProps);
      const readOnlyContent = computeReadOnlyContent(richProps);
      // Boundary = readOnlyContent.length + '\n\n'.length
      expect(boundary).toBe(readOnlyContent.length + 2);
    });

    it('should have zero boundary in legacy mode', () => {
      const boundary = computeReadOnlyBoundary(legacyProps);
      expect(boundary).toBe(0);
    });

    it('should have no separator when readOnlyContent is empty', () => {
      const props: CodeEditorLogicInput = {
        value: 'code',
        starterCode: 'function fn() {}',
        providedCode: '',
        helperFunctions: '',
        boilerplate: '',
      };
      const separator = computeSeparator(props);
      expect(separator).toBe('');
    });
  });

  describe('change filter - rejecting changes in read-only region', () => {
    const boundary = computeReadOnlyBoundary(richProps);

    it('should block a change that starts within the read-only region', () => {
      const allowed = shouldAllowChange(boundary, [{ from: 0, to: 5 }]);
      expect(allowed).toBe(false);
    });

    it('should block a change at position 0 (very start of read-only region)', () => {
      const allowed = shouldAllowChange(boundary, [{ from: 0, to: 0 }]);
      expect(allowed).toBe(false);
    });

    it('should block a change that ends within the read-only region', () => {
      const allowed = shouldAllowChange(boundary, [{ from: 10, to: 10 }]);
      expect(allowed).toBe(false);
    });

    it('should block a change that spans the boundary (partially in read-only)', () => {
      const allowed = shouldAllowChange(boundary, [{ from: boundary - 5, to: boundary + 5 }]);
      expect(allowed).toBe(false);
    });

    it('should block if any change in a batch touches the read-only region', () => {
      const allowed = shouldAllowChange(boundary, [
        { from: boundary + 10, to: boundary + 15 }, // valid
        { from: 5, to: 10 }, // in read-only
      ]);
      expect(allowed).toBe(false);
    });
  });

  describe('change filter - accepting changes in editable region', () => {
    const boundary = computeReadOnlyBoundary(richProps);

    it('should allow a change at exactly the boundary position', () => {
      const allowed = shouldAllowChange(boundary, [{ from: boundary, to: boundary }]);
      expect(allowed).toBe(true);
    });

    it('should allow a change after the boundary', () => {
      const allowed = shouldAllowChange(boundary, [{ from: boundary + 10, to: boundary + 20 }]);
      expect(allowed).toBe(true);
    });

    it('should allow multiple changes all within the editable region', () => {
      const allowed = shouldAllowChange(boundary, [
        { from: boundary, to: boundary + 5 },
        { from: boundary + 10, to: boundary + 15 },
      ]);
      expect(allowed).toBe(true);
    });

    it('should allow insertion at the end of the document', () => {
      const fullDoc = computeFullDocument(richProps);
      const docEnd = fullDoc.length;
      const allowed = shouldAllowChange(boundary, [{ from: docEnd, to: docEnd }]);
      expect(allowed).toBe(true);
    });
  });

  describe('reset behavior', () => {
    it('should reset to starterCode in rich mode', () => {
      const resetValue = computeResetValue(richProps);
      expect(resetValue).toBe(richProps.starterCode);
    });

    it('should reset to boilerplate in legacy mode', () => {
      const resetValue = computeResetValue(legacyProps);
      expect(resetValue).toBe(legacyProps.boilerplate);
    });

    it('should reset to empty string if starterCode is empty in rich mode', () => {
      const props: CodeEditorLogicInput = {
        value: 'some modified code',
        starterCode: '',
        providedCode: '// platform',
        boilerplate: '',
      };
      // Note: with starterCode as empty string and providedCode defined, this is rich mode
      expect(isRichMode(props)).toBe(true);
      expect(computeResetValue(props)).toBe('');
    });

    it('should NOT reset the read-only region (only editable resets to starterCode)', () => {
      // In rich mode, reset emits starterCode - not the full document
      // The read-only content stays intact since only the value/editable portion changes
      const resetValue = computeResetValue(richProps);
      const readOnlyContent = computeReadOnlyContent(richProps);

      // The reset value should be the starterCode, NOT include read-only content
      expect(resetValue).not.toContain(readOnlyContent);
      expect(resetValue).toBe(richProps.starterCode);
    });
  });

  describe('onChange emission - only emits editable portion', () => {
    it('should extract only the editable content from the full document', () => {
      const boundary = computeReadOnlyBoundary(richProps);
      const fullDoc = computeFullDocument(richProps);

      const editable = extractEditableContent(fullDoc, boundary);
      expect(editable).toBe(richProps.value);
    });

    it('should return empty string when document only contains read-only content', () => {
      const props: CodeEditorLogicInput = {
        value: '',
        starterCode: '',
        providedCode: '// platform code',
        helperFunctions: 'class TreeNode {}',
        boilerplate: '',
      };
      const boundary = computeReadOnlyBoundary(props);
      const fullDoc = computeFullDocument(props);

      const editable = extractEditableContent(fullDoc, boundary);
      expect(editable).toBe('');
    });

    it('should correctly extract multi-line editable content', () => {
      const multiLineValue = 'function solve(root) {\n  if (!root) return null;\n  return root.val;\n}';
      const props: CodeEditorLogicInput = {
        ...richProps,
        value: multiLineValue,
      };
      const boundary = computeReadOnlyBoundary(props);
      const fullDoc = computeFullDocument(props);

      const editable = extractEditableContent(fullDoc, boundary);
      expect(editable).toBe(multiLineValue);
    });

    it('should not include the separator in the editable content', () => {
      const boundary = computeReadOnlyBoundary(richProps);
      const fullDoc = computeFullDocument(richProps);

      const editable = extractEditableContent(fullDoc, boundary);
      expect(editable.startsWith('\n\n')).toBe(false);
    });
  });

  describe('backward compatibility with legacy props', () => {
    it('should function as a normal editor in legacy mode (zero boundary)', () => {
      const boundary = computeReadOnlyBoundary(legacyProps);
      expect(boundary).toBe(0);

      // All changes are allowed since boundary is 0
      const allowed = shouldAllowChange(boundary, [{ from: 0, to: 10 }]);
      expect(allowed).toBe(true);
    });

    it('should have no read-only content in legacy mode', () => {
      const content = computeReadOnlyContent(legacyProps);
      expect(content).toBe('');
    });

    it('should emit the entire document as editable in legacy mode', () => {
      const boundary = computeReadOnlyBoundary(legacyProps);
      const editable = extractEditableContent(legacyProps.value, boundary);
      expect(editable).toBe(legacyProps.value);
    });

    it('should reset to boilerplate in legacy mode', () => {
      const resetValue = computeResetValue(legacyProps);
      expect(resetValue).toBe(legacyProps.boilerplate);
    });

    it('should work when starterCode is provided without providedCode or helperFunctions', () => {
      const props: CodeEditorLogicInput = {
        value: 'some code',
        starterCode: 'function fn() {}',
        boilerplate: 'function fn() {}',
      };
      // Without providedCode/helperFunctions, it should fall back to legacy mode
      expect(isRichMode(props)).toBe(false);
      expect(computeReadOnlyBoundary(props)).toBe(0);
    });
  });
});
