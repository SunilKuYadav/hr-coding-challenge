import {_03 } from "./_03.js";
import {deepEqual, makeDeepCopy} from "../helperUtils.js";

const inputs = _03.inputs
const outputs = _03.outputs

// Simplified way - Time O(n) | Space O(min(n, a))
const solution_01 = (text) => {
    const lastSeen = {}
    const longest = [0, 1]
    let startIndex = 0

    for (let i = 0; i < text.length; i++) {
        let char = text[i]
        if(char in lastSeen) {
            startIndex = Math.max(startIndex, lastSeen[char] + 1);
        }
        if (longest[1] - longest[0] < i + 1 - startIndex) {
            longest[0] = startIndex
            longest[1] = i + 1
        }
        lastSeen[char] = i
    }
    return text.substring(longest[0], longest[1])
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

const solutions = [solution_01]

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

export const _03_01 = {runTest}