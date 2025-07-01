import {_02 } from "./_02.js";
import { LinkedList, makeDeepCopy} from "../helperUtils.js";

const inputs = _02.inputs
const outputs = _02.outputs

// Simplified way - Time O(n) | Space O(1)
const solution_01 = (head) => {
    if (!head || !head.next) {
        return null
    }

    let first = head
    let second = head

    while (second && second.next) {
        first = first.next
        second = second.next.next
    }

    if (!second && !second.next) {
        return null
    }

    first = head
    while (first !== second) {
        first = first.next
        second = second.next
    }

    return first
}


const runFile = (solution, input, output, testCaseIndex) => {
    const head = LinkedList.createCyclicSinglyList(LinkedList.createSinglyList(input[0]), input[1])

    const getOutput = solution(head)

    const isPass = !getOutput || (getOutput && getOutput.data === LinkedList.createSinglyList(output).data)
    if (isPass) {
        console.log('Pass')
        return { passed: true }
    } else {
        console.log('Input')
        LinkedList.printSinglyList(LinkedList.isValidSinglyList(head))
        console.log('Your Output')
        LinkedList.printSinglyList(LinkedList.isValidSinglyList(getOutput))
        console.log('Expected Output')
        LinkedList.printSinglyList(LinkedList.createSinglyList(output))
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

export const _02_01 = {runTest}