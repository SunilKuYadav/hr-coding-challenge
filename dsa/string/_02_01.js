import {_02 } from "./_02.js";
import {deepEqual, makeDeepCopy} from "../helperUtils.js";

const inputs = _02.inputs
const outputs = _02.outputs

// Helper function
const isPalindrome = text => text.split('').reverse().join('') === text

// By Dum way - Time O(n^3) | Space O(n^3)
const solution_01 = (text) => {
    const length = text.length;
    let subString = []

    for (let i = 0; i < length; i++) {
        for (let j = i; j < length; j++) {
            subString.push(text.substring(i, j + 1));
        }
    }

    subString = subString.filter(isPalindrome)
    let longestPalindrome = subString[0]

    for (let i = 0; i < subString.length - 1; i++) {
        if (subString[i].length > longestPalindrome.length) {
            longestPalindrome = subString[i]
        }
    }

    return longestPalindrome
}

// Two pointer - Time O(n^2) | Space O(1)
const getLongestPalindromeFrom = (string, leftIdx, rightIdx) => {
    while (leftIdx >= 0 && rightIdx < string.length) {
        if (string[leftIdx] !== string[rightIdx]) {
            break;
        }
        leftIdx--
        rightIdx++
    }
    return [leftIdx + 1, rightIdx]
}
const solution_02 = (text) => {
    let currentLongest = [0, 1]
    for (let i = 1; i < text.length; i++) {
        let odd = getLongestPalindromeFrom(text, i - 1, i + 1)
        let even = getLongestPalindromeFrom(text, i - 1, i)

        let longest = (odd[1] - odd[0]) > (even[1] - even[0]) ? odd : even
        currentLongest = (longest[1] - longest[0]) > (currentLongest[1] - currentLongest[0]) ? longest : currentLongest
    }
    return text.substring(currentLongest[0], currentLongest[1])
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

const solutions = [solution_01, solution_02]

const runTest = (solution = solutions) => {
    inputs.forEach((input, i) => {
        solution.forEach(sol => {
            runFile(sol, makeDeepCopy(input), makeDeepCopy(outputs[i]))
        })
    })
}


runTest()
export const _01_01 = [runTest]