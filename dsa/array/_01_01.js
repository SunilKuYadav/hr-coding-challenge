import { _01 } from "./_01.js";
import {deepEqual, makeDeepCopy} from "../helperUtils.js";

const inputs = _01.inputs
const outputs = _01.outputs

// Using Inbuilt Methods - O(n) Time and O(1) Space
const _01_solution = input => input.reverse()

// Using Two Pointers - O(n) Time and O(1) Space
const _01_solution_01 = input => {
    let left = 0, right = input.length - 1

    while (left <= right) {
        [input[left], input[right]] = [input[right], input[left]]
        left++
        right--
    }
    return input
}

// By Swapping Elements - O(n) Time and O(1) Space
const _01_solution_02 = input => {
    const length = input.length

    for (let i = 0; i < length / 2; i++) {
        const temp = input[i]
        input[i] = input[length - i - 1]
        input[length - i - 1] = temp
    }
    return input
}

// Using Recursion - O(n) Time and O(n) Space
const recursion = (input, start, end) => {
    // base case
    if(start >= end) {
        return
    }

    [input[start], input[end]] = [input[end], input[start]]

    // call again
    recursion(input, start + 1, end - 1)
}
const _01_solution_03 = input => {
    recursion(input, 0, input.length - 1)
    return input
}


const runFile = (solution, input, output, testCaseIndex) => {
    const getOutput = solution(input)

    const isPass = deepEqual(getOutput, output)
    if(isPass) {
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

const solutions = [_01_solution, _01_solution_01, _01_solution_02, _01_solution_03]

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

export const _01_01 = {runTest}