// Greatest of two numbers

const firstNumber = 5;
const secondNumber = 10;

// Time O(1)
// Space O(1)
const geratestNumber = (firstNumber, secondNumber) => {
    return Math.max(firstNumber, secondNumber);

    // return firstNumber > secondNumber ? firstNumber : secondNumber;

    // if (firstNumber > secondNumber) {
    //     return firstNumber;
    // }
    // return secondNumber;
}

console.log(`Greatest b/w ${firstNumber} and ${secondNumber} is ${geratestNumber(firstNumber, secondNumber)}`)