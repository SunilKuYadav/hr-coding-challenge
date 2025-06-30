import {_07} from "./_07.js";
import {deepEqual, makeDeepCopy} from "../helperUtils.js";

const inputs = _07.inputs
const outputs = _07.outputs

// Iterative way - Time O(n) | Space O(1)
const solution_01 = (arr) => {
    let longestPickLength = 0
    let i = 1

    while (i < arr.length - 1) {
        const isPick = arr[i - 1] < arr[i] && arr[i] > arr[i + 1]
        if (!isPick) {
            i++
            continue
        }

        let leftIndex = i - 2
        let rightIndex = i + 2

        // check left side
        while (leftIndex >= 0 && arr[leftIndex] < arr[leftIndex + 1]) {
            leftIndex--
        }
        // check right side
        while (rightIndex < arr.length && arr[rightIndex] < arr[rightIndex - 1]) {
            rightIndex++
        }

        let currentPickLength = rightIndex - leftIndex - 1
        longestPickLength = Math.max(longestPickLength, currentPickLength)
        i = rightIndex
    }
    return longestPickLength
}


const runFile = (solution, input, output) => {
    const getOutput = solution(input)

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

const solutions = [solution_01]

const runTest = (solution = solutions) => {
    inputs.forEach((input, i) => {
        solution.forEach(sol => {
            runFile(sol, makeDeepCopy(input), makeDeepCopy(outputs[i]))
        })
    })
}

runTest()

export const _07_01 = [runTest]
