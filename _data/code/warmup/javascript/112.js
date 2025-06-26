// Reverse of a number

const number = 1234;

// Time O(number_of_digit)
// Space O(1)
const reverseNumber = (number) => {
    let result = 0;
    while (number > 0) {
        result = (result * 10) + (number % 10);
        number = Math.floor(number / 10);
    }
    return result;
}

console.log(reverseNumber(number));