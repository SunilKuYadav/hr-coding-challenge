// How do you find all pairs of an integer array whose sum is equal to a given number?

const input1 = [1, 2, 3, 4, 5, 6, 7];
const input2 = [1, 5, 7, -1];
const input3 = [10, 12, 10, 15, -1, 7, 6, 5, 4, 2, 1, 1, 1];
const input4 = [1, -2, 1, -2];

// Time O(n)
// Space O(n)
const getNumbers = (arr, sum) => {
  let hash = {};
  const result = [];

  // loop over arr
  arr.forEach((value, index) => {
    // check if expected value present in hashTable
    if (sum - value in hash) {
      // found pair [expectedIndex, currentIndex]
      result.push([[hash[sum - value]], index]);

      // delete found match value
      delete hash[sum - value];
    } else {
      // update hashTable key:value i.e. expectedNumber:arrIndex
      // target = a + b
      // target - a = b
      hash[value] = index;
    }
  });
  return result;
};

const out = getNumbers(input1, 9);
console.log(`Input array : ${input1} Target sum : ${9}`);
out.forEach((item, index) => console.log(`${index + 1} Pair is ${[...item]}`));

const out1 = getNumbers(input2, 6);
console.log(`Input array : ${input2} Target sum : ${6}`);
out1.forEach((item, index) => console.log(`${index + 1} Pair is ${[...item]}`));

const out2 = getNumbers(input3, 11);
console.log(`Input array : ${input3} Target sum : ${11}`);
out2.forEach((item, index) => console.log(`${index + 1} Pair is ${[...item]}`));

const out3 = getNumbers(input4, 2);
console.log(`Input array : ${input4} Target sum : ${2}`);
out3.forEach((item, index) => console.log(`${index + 1} Pair is ${[...item]}`));
