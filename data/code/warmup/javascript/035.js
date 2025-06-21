// How do you check if a given string is a palindrome ?

// A string is said to be palindrome if the reverse of the string is the same as the string.For example, “abba” is a palindrome because the reverse of “abba” will be equal to “abba” so both of these strings are equal and are said to be a palindrome, but “abbc” is not a palindrome.

const input = "abba";
const input1 = "abbaa";

const checkPalindrome = str => {
    const len = str.length - 1;

    for (let i = 0; i < len / 2; i++) {
        let a = str[i];
        let b = str[len - i];
        if (a !== b) {
            return false;
        }
    }
    return true;
}
const checkPalindrome1 = str => str === str.split("").reverse().join("");

const out = checkPalindrome(input);
console.log(out);
const out1 = checkPalindrome1(input1);
console.log(out1);