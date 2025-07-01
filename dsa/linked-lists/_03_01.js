import {_03 } from "./_03.js";
import { LinkedList, makeDeepCopy} from "../helperUtils.js";

const inputs = _03.inputs
const outputs = _03.outputs

// Simplified way - Time O(n) | Space O(1)
const solution_01 = (head) => {
    let [pointer1, pointer2] = [null, head]

    while (pointer2 !== null) {
        const pointer3 = pointer2.next

        pointer2.next = pointer1
        pointer1 = pointer2
        pointer2 = pointer3
    }

   return pointer1
}


const runFile = (solution, input, output, testCaseIndex) => {
    const head = LinkedList.createSinglyList(input)
    const outputList = LinkedList.createSinglyList(output)

    const getOutput = solution(head)

    const isPass = LinkedList.areSinglyListIsEqual(getOutput, outputList)
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

export const _03_01 = {runTest}