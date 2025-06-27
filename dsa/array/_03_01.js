import { _03 } from './_03.js'
import {deepEqual, makeDeepCopy} from "../helperUtils.js";

const inputs = _03.inputs
const outputs = _03.outputs

// Dum way - Time O(n^3) | Space O(n)
const solution_01 = (arr, targetSum) => {
    arr = arr.sort((a, b) => a - b)
    const result = []
    for (let i = 0; i < arr.length - 2; i++) {
        for (let j = i + 1; j < arr.length - 1; j++) {
            for (let k = j + 1; k < arr.length; k++) {
                if (arr[i] + arr[j] + arr[k] === targetSum) {
                    result.push([arr[i], arr[j], arr[k]]);
                }
            }
        }
    }
    return result
}

// Using two pointer - Time O(n^2) | Space O(n)
// Condition - only if sorted arr
const solution_02 = (arr, targetSum) => {
    arr = arr.sort((a, b) => a - b)
    const result = []
    for (let i = 0; i < arr.length - 2; i++) {
        let left = i + 1
        let right = arr.length - 1
        while (left < right) {
            const potentialSum = arr[i] + arr[left] + arr[right]
            if (potentialSum === targetSum) {
                result.push([arr[i], arr[left], arr[right]])
                left++
                right--
            } else if (potentialSum > targetSum) {
                right--
            } else if (potentialSum < targetSum) {
                left++
            }
        }
    }

    return result
}


const runFile = (solution, input, output) => {
    const getOutput = solution(input[0], input[1])

    const isPass = deepEqual(getOutput, output)
    if (isPass) {
        console.log('Pass')
    } else {
        console.log('Input', input)
        console.log('Your Output', getOutput)
        console.log('Expected Output', output)
        console.error( 'Fail')
    }
}

const solutions = [solution_01, solution_02]
inputs.forEach((input, i) => {
    solutions.forEach(solution => {
        runFile(solution, makeDeepCopy(input), makeDeepCopy(outputs[i]))
    })
})