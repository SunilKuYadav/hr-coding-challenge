import {_05} from "./_05.js";
import {deepEqual, makeDeepCopy} from "../helperUtils.js";

const inputs = _05.inputs
const outputs = _05.outputs

// Dum way - Time O(n) | Space O(1)
const isDirectionBreak = (direction, curNum, prevNum) => {
    const curDirection = curNum - prevNum;
    if (curDirection > 0) return direction < 0
    return direction > 0
}
const solution_01 = (arr) => {
    if (arr.length <= 2) return true
    let direction = arr[1] - arr[0];

    for (let i = 1; i < arr.length; i++) {
        if (direction === 0) {
            direction = arr[i] - arr[i - 1]
            continue
        }
        if (isDirectionBreak(direction, arr[i], arr[i - 1])) {
            return false;
        }
    }
    return true;

}

// Simplified way - Time O(n) | Space O(1)
const solution_02 = (arr) => {
    let upDirection = true
    let downDirection = true

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] - arr[i - 1] > 0) downDirection = false
        if (arr[i] - arr[i - 1] < 0) upDirection = false
    }

    return upDirection || downDirection
}


const runFile = (solution, input, output, testCaseIndex) => {
    const getOutput = solution(input)

    const isPass = deepEqual(getOutput, output)
    if (isPass) {
        console.log('Pass')
        return { passed: true }
    } else {
        console.log('Input', input)
        console.log('Your Output', getOutput)
        console.log('Expected Output', output)
        console.error('Fail')
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

export const _05_01 = {runTest}
