// Palindrome number
// A palindromic number is a number that remains the same when its digits are reversed.


const number = 1221;

const reverseNumber = (number) => {
    let result = 0;
    while (number > 0) {
        result = (result * 10) + (number % 10);
        number = Math.floor(number / 10);
    }
    return result;
}

// Time O(number_of_digit)
// SPace O(1)
const checkPalidrome = (number) => {
    return number === reverseNumber(number);
}

console.log(checkPalidrome(number));