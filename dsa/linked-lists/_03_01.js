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


const runFile = (solution, input, output) => {
    const head = LinkedList.createSinglyList(input)
    const outputList = LinkedList.createSinglyList(output)

    const getOutput = solution(head)

    const isPass = LinkedList.areSinglyListIsEqual(getOutput, outputList)
    if (isPass) {
        console.log('Pass')
    } else {
        console.log('Input')
        LinkedList.printSinglyList(LinkedList.isValidSinglyList(head))
        console.log('Your Output')
        LinkedList.printSinglyList(LinkedList.isValidSinglyList(getOutput))
        console.log('Expected Output')
        LinkedList.printSinglyList(LinkedList.createSinglyList(output))
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
export const _01_01 = [runTest]