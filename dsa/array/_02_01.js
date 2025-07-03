import { _02 } from './_02.js'
import {deepEqual} from "../helperUtils.js";

const inputs = _02.inputs
const outputs = _02.outputs

// Dum way - Time O(n^2) | Space O(1)
const solution_01 = (arr, targetSum) => {
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = i+1; j < arr.length; j++) {
            if (arr[i] + arr[j] === targetSum) {
                // sorting is optional
                return [arr[i], arr[j]].sort((a, b) => a - b);
            }
        }
    }
    return 'Not Found'
}

// Using hash table - Time O(n) | Space O(n)
const solution_02 = (arr, targetSum) => {
    const hash = []
    for (let i = 0; i < arr.length; i++) {
        const potentialMatch = targetSum - arr[i]
        if (hash.includes(potentialMatch)) {
            return [arr[i], targetSum - arr[i]].sort((a, b) => a - b)
        } else {
            hash.push(arr[i])
        }
    }
    return 'Not Found'
}

// Using two pointers - Time O(n) | space O(1)
// Condition - if arr is sorted
const solution_03 = (arr, targetSum) => {
    let left = 0, right = arr.length - 1
    for (let i = 0; i < arr.length; i++) {
        const potentialMatch = arr[left] + arr[right]
        if (potentialMatch === targetSum) {
            return [arr[left], arr[right]].sort((a, b) => a - b)
        } else if(potentialMatch > targetSum) {
            right--
        } else if (potentialMatch < targetSum) {
            left++
        }
    }
    return 'Not Found'
}

const runFile = (solution, input, output, testCaseIndex) => {
    const getOutput = solution(input[0], input[1])

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

const solutions = [solution_01, solution_02, solution_03]

const runTest = (solution = solutions) => {
    for (let i = 0; i < inputs.length; i++) {
        for (let j = 0; j < solution.length; j++) {
            const result = runFile(solution[j], inputs[i], outputs[i], i)
            if (!result.passed) {
                return result
            }
        }
    }
    return { passed: true }
}

// runTest()

export const _02_01 = {runTest}