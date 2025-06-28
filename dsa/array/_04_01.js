import {_04} from "./_04.js";
import {deepEqual, makeDeepCopy} from "../helperUtils.js";

const inputs = _04.inputs
const outputs = _04.outputs

// Dum way - Time O(n*m) | Space O(1)
const solution_01 = (firstArr, secondArr) => {
    let result = [];
    let initDiff = Number.MAX_SAFE_INTEGER;

    for (let i = 0; i < firstArr.length -1; i++) {
        for (let j = 0; j < secondArr.length; j++) {
            const diff = Math.max(firstArr[i], secondArr[j]) - Math.min(firstArr[i], secondArr[j]);

            if (diff < initDiff) {
                initDiff = diff;
                result = [firstArr[i], secondArr[j]];
            }
        }
    }
    return result;
}

// Using two pointer - Time O(nLog(n) + mLog(m)) | Space O(1)
// Condition: need to sort the both arr
const solution_02 = (firstArr, secondArr) => {
    firstArr = firstArr.sort((a, b) => a - b);
    secondArr = secondArr.sort((a, b) => a - b);

    let firstArrPointer = 0
    let secondArrPointer = 0
    let initDiff = Number.MAX_SAFE_INTEGER;
    let current = Number.MAX_SAFE_INTEGER;
    let result =[]

    while (firstArrPointer < firstArr.length && secondArrPointer < secondArr.length) {
        const firstNumber = firstArr[firstArrPointer];
        const secondNumber = secondArr[secondArrPointer];
        if (firstNumber < secondNumber) {
            current = secondNumber - firstNumber;
            firstArrPointer++
        } else if (firstNumber > secondNumber) {
            current = firstNumber - secondNumber
            secondArrPointer++
        } else {
            return [firstNumber, secondNumber]
        }
        if (initDiff > current) {
            initDiff = current
            result = [firstNumber, secondNumber]
        }
    }
    return result;
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