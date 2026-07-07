export const TREE_HELPERS = `
class TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  constructor(val?: number, left?: TreeNode | null, right?: TreeNode | null) {
    this.val = val ?? 0;
    this.left = left ?? null;
    this.right = right ?? null;
  }
}

function buildTree(values: (number | null)[]): TreeNode | null {
  if (!values || values.length === 0 || values[0] === null) return null;
  const root = new TreeNode(values[0] as number);
  const queue: TreeNode[] = [root];
  let i = 1;
  while (i < values.length) {
    const node = queue.shift()!;
    if (i < values.length && values[i] !== null) {
      node.left = new TreeNode(values[i] as number);
      queue.push(node.left);
    }
    i++;
    if (i < values.length && values[i] !== null) {
      node.right = new TreeNode(values[i] as number);
      queue.push(node.right);
    }
    i++;
  }
  return root;
}
`;
