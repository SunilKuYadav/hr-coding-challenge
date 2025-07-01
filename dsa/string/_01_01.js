import {_01 } from "./_01.js";
import {deepEqual, makeDeepCopy} from "../helperUtils.js";

const inputs = _01.inputs
const outputs = _01.outputs

// By Reversing - Time O(n) | Space O(n)
const solution_01 = (text) => {
    const textLength = text.length - 1
    const reverseText = []

    for (let i = textLength; i >= 0; i--) {
        reverseText.push(text[i])
    }

    return text === reverseText.join('')
}

// Simplified way - Time O(n) | Space O(1)
const solution_02 = (text) => {
    const textLength = text.length - 1
    let reverseText = ''

    for (let i = textLength; i >= 0; i--) {
        reverseText += text[i]
    }

    return reverseText === text
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

export const _01_01 = {runTest}