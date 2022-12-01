// How do you find the largest and smallest number in an unsorted integer array?

const input1 = [2, 4, 9, 2, 0, 16, 24];
const input2 = [2, 4, 9, 2, 0, 16, 24];
const input3 = [2, 4, 9, 2, 0, 16, 24];

// Time O(n)
// Space O(1)
const largestAndSmallestNumber1 = (arr) => {
  const len = arr.length;
  // check if array is emapty
  if (len === 0) {
    return [-1, -1];
  }
  let largest = arr[0];
  let smallest = arr[0];
  arr.forEach((value) => {
    if (value > largest) {
      largest = value;
    }
    if (value < smallest) {
      smallest = value;
    }
  });
  return [smallest, largest];
};

// using Math util
const largestAndSmallestNumber2 = (arr) => {
  const len = arr.length;
  // check if array is emapty
  if (len === 0) {
    return [-1, -1];
  }
  const largest = Math.max(...arr);
  const smallest = Math.min(...arr);
  return [smallest, largest];
};

// using reducer
const largestAndSmallestNumber3 = (arr) => {
  const len = arr.length;
  // check if array is emapty
  if (len === 0) {
    return [-1, -1];
  }
  const largest = arr.reduce((prev, curr) => (prev < curr ? curr : prev));
  const smallest = arr.reduce((prev, curr) => (prev > curr ? curr : prev));
  return [smallest, largest];
};

const out1 = largestAndSmallestNumber1(input1);
const out2 = largestAndSmallestNumber2(input2);
const out3 = largestAndSmallestNumber3(input3);

console.log(
  `Input : ${input1}\nSmallest number : ${out1[0]}\nLargest number : ${out1[1]}`
);
console.log(
  `Input : ${input2}\nSmallest number : ${out2[0]}\nLargest number : ${out2[1]}`
);
console.log(
  `Input : ${input3}\nSmallest number : ${out3[0]}\nLargest number : ${out3[1]}`
);
