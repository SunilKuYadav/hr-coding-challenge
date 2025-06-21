// Sum of First N Natural numbers

// Time O(n)
// Space (1)
const findSumOfNaturalNumbers = (number) => {
    let sum = 0;
    for (let i = 1; i <= number; i++) {
        sum += i;
    }
    return sum;
}

// Time O(1)
// Space (1)
const findSumOfNaturalNumber = (number) => {
    return number * ((number + 1) / 2);
}


console.log(findSumOfNaturalNumber(10));