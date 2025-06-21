// Sum of digits of a number

const number = 1234;

// Time O(number_of_digit)
// Space O(1)
const findSumOfDigit = (number) => {
    let sum = 0;
    while (number > 0) {
        sum += (number % 10);
        number = Math.floor(number / 10);
    }
    return sum;
}

console.log(findSumOfDigit(number));