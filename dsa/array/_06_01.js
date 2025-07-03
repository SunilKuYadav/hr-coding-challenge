import {_06} from "./_06.js";
import {deepEqual, makeDeepCopy} from "../helperUtils.js";

const inputs = _06.inputs
const outputs = _06.outputs

// Iterative way - Time O(n) | Space O(1)
const solution_01 = (arr) => {
    const result = []
    let startRow = 0, endRow = arr.length - 1;
    let startCol = 0, endCol = arr[0].length - 1;

    while (startRow <= endRow && startCol <= endCol) {
        // Top row
        for (let i = startCol; i <= endCol; i++) {
            result.push(arr[startRow][i]);
        }
        // right col
        for (let i = startRow + 1; i <= endRow; i++) {
            result.push(arr[i][endCol])
        }
        // bottom row reverse
        for (let i = endCol - 1; i >= startCol; i--) {
            result.push(arr[endRow][i]);
        }
        // left col reverse
        for (let i = endRow - 1; i >= startRow + 1; i--) {
            result.push(arr[i][startCol]);
        }

        startRow++
        endRow--
        startCol++
        endCol--
    }
    return result
}

// Recursive way - Time O(n) | Space O(1)
const fillSpiral = (arr, startRow, endRow, startCol, endCol, result) => {
    if (startCol > endCol || startRow > endRow) return

    // Top row
    for (let i = startCol; i <= endCol; i++) {
        result.push(arr[startRow][i]);
    }
    // right col
    for (let i = startRow + 1; i <= endRow; i++) {
        result.push(arr[i][endCol])
    }
    // bottom row reverse
    for (let i = endCol - 1; i >= startCol; i--) {
        result.push(arr[endRow][i]);
    }
    // left col reverse
    for (let i = endRow - 1; i >= startRow + 1; i--) {
        result.push(arr[i][startCol]);
    }

    fillSpiral(arr, startRow + 1, endRow - 1, startCol + 1, endCol -1, result);

}
const solution_02 = (arr) => {
    const result = []
    fillSpiral(arr, 0, arr.length - 1, 0, arr[0].length - 1, result)
    return result
}


const runFile = (solution, input, output, testCaseIndex) => {
    const getOutput = solution(input)

    const isPass = deepEqual(getOutput, output)
    if (isPass) {
        console.log('Pass')
        return { passed: true }
    } else {
        return { 
            passed: false, 
            testCaseIndex,
            input, 
            yourOutput: getOutput, 
            expectedOutput: output 
        }
    }
}

const solutions = [solution_01, solution_02]

const runTest = (solution = solutions) => {
    for (let i = 0; i < inputs.length; i++) {
        for (let j = 0; j < solution.length; j++) {
            const result = runFile(solution[j], makeDeepCopy(inputs[i]), makeDeepCopy(outputs[i]), i)
            if (!result.passed) {
                return result
            }
        }
    }
    return { passed: true }
}

// runTest()

export const _06_01 = {runTest}