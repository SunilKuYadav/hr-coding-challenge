// Sum of numbers in a given range

const getSum = number => {
    return number * ((number + 1) / 2);
}

// Time O(1)
// Space O(1)
const findSumInRange = (start, end) => {
    return getSum(end) - getSum(start - 1);
}

console.log(findSumInRange(5, 10))