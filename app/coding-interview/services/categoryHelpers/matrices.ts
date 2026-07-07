export const MATRIX_HELPERS = `
function parseMatrix(input: number[][]): number[][] {
  return input;
}

function printMatrix(matrix: number[][]): string {
  return matrix.map(row => row.join(' ')).join('\\n');
}

function createMatrix(rows: number, cols: number, fill: number = 0): number[][] {
  return Array.from({ length: rows }, () => new Array(cols).fill(fill));
}

function getNeighbors(
  matrix: number[][],
  row: number,
  col: number,
  directions: [number, number][] = [[-1,0],[1,0],[0,-1],[0,1]]
): [number, number][] {
  const result: [number, number][] = [];
  for (const [dr, dc] of directions) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < matrix.length && nc >= 0 && nc < matrix[0].length) {
      result.push([nr, nc]);
    }
  }
  return result;
}
`;
