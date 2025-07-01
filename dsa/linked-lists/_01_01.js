import {_01 } from "./_01.js";
import { LinkedList, makeDeepCopy} from "../helperUtils.js";

const inputs = _01.inputs
const outputs = _01.outputs

// Simplified way - Time O(n) | Space O(1)
const solution_01 = (head, index) => {
    let counter = 0

    let firstNode = head
    let secondNode = head

    // move secondNode index place ahead
    while (counter < index) {
        secondNode = secondNode.next
        counter++
    }

    // Check for base case where list length equal to index
    if (secondNode === null) {
        if (head.next) {
            head.data = head.next.data
            head.next = head.next.next
            return  head
        }
        return null
    }

    // Loop till secondNode reaches end and update pointer
    while (secondNode.next !== null) {
        secondNode = secondNode.next
        firstNode = firstNode.next
    }

    // delete / replace link
    firstNode.next = firstNode.next.next

    return head
}


const runFile = (solution, input, output) => {
    const head = LinkedList.createSinglyList(input[0])
    const atIndex = input[1]

    const getOutput = solution(head, atIndex)

    const isPass = LinkedList.areSinglyListIsEqual(getOutput || null, LinkedList.createSinglyList(output))
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