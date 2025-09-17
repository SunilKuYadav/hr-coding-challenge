// Array

// Largest element in array
// Time O(n) | Space O(1)
const getLargestElementFromArray = (numbers) => {
  // return numbers.sort((a, b) => a - b)[numbers.length - 1] // Time O(n log n)
  let largest = numbers[0];

  for (let i = 1; i < numbers.length - 1; i++) {
    if (numbers[i] > largest) {
      largest = numbers[i];
    }
  }
  return largest;
};
// const numbers = [3, 2, 1, 5, 4]
// console.log(getLargestElementFromArray(numbers))

// find second largest number in array
// Time O(n) | Space O(1)
const getSecondLargestNumber = (numbers) => {
  let largest = numbers[0];
  let secondLargest = -Infinity;

  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] > largest) {
      secondLargest = largest;
      largest = numbers[i];
    } else if (numbers[i] > secondLargest && numbers[i] < largest) {
      secondLargest = numbers[i];
    }
  }
  return secondLargest;
};
// const numbers = [1, 2, 4, 7, 7, 5];
// console.log(getSecondLargestNumber(numbers));

// Check weather a array is sorted or not
// Time O(n) | Space O(1)
const isArraySorted = (numbers) => {
  let ascending = true;
  let descending = true;

  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] < numbers[i - 1]) ascending = false;
    if (numbers[i] > numbers[i - 1]) descending = false;
  }

  return ascending || descending;
};
// const numbers = [1, 2, 4, 7, 7, 5];
// console.log(isArraySorted(numbers));

// remove duplicate number from sorted array
// Time O(n) | Space O(1)
const removeDuplicateFromSortedArray = (arr) => {
  // return arr.filter((val, index) => index === 0 || val !== arr[index - 1]);

  let left = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== arr[left]) {
      left++;
      arr[left] = arr[i];
    }
  }
  return arr.splice(0, left + 1);
};
// const numbers = [1, 1, 2, 3, 3, 4, 4, 7, 7, 8];
// console.log(removeDuplicateFromSortedArray(numbers));

// rotate a array by k place
// Time O(end - start) | Space O(1)
const reverseSubArray = (arr, start, end) => {
  while (start < end) {
    [arr[start], arr[end]] = [arr[end], arr[start]];
    start++;
    end--;
  }
  return arr;
};
// Time O(2n) | Space O(1)
const rotateArrayByKPlace = (arr, place) => {
  reverseSubArray(arr, 0, place - 1); // O(place)
  reverseSubArray(arr, place, arr.length - 1); // O(n - place)
  reverseSubArray(arr, 0, arr.length - 1); // O(n)

  return arr;
};
// const numbers = [1, 2, 3, 4, 5, 6, 7];
// // first reverse => [3, 2, 1, 4, 5, 6, 7]
// // second reverse => [3, 2, 1, 7, 6, 5, 4]
// // third reverse => [4, 5, 6, 7, 1, 2, 3]
// console.log(rotateArrayByKPlace(numbers, 3));

// Move all the zero to the end of array
// Time O(n) | Space O(1)
const moveAllZeroToEnd = (arr) => {
  let left = -1;
  // find first zero
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === 0) {
      left = i;
      break;
    }
  }
  // zero not found
  if (left === -1) return arr;
  // swap zero with non zero
  for (let i = left + 1; i < arr.length; i++) {
    if (arr[i] !== 0) {
      [arr[left], arr[i]] = [arr[i], arr[left]];
      left++;
    }
  }
  return arr;
};
// const numbers = [1, 0, 2, 3, 2, 0, 0, 4, 5, 1];
// console.log(moveAllZeroToEnd(numbers));

// Find Union of two sorted array
// Time 0(1) | Space O(1)
const isLastElementDiff = (arr, num) =>
  arr.length === 0 || arr[arr.length - 1] !== num;
// Time 0(n + m) | Space O(n + m)
const findUnionOfSortedArray = (arr1, arr2) => {
  let firstPointer = 0;
  let secondPointer = 0;
  const unionArray = [];

  while (firstPointer < arr1.length && secondPointer < arr2.length) {
    if (arr1[firstPointer] <= arr2[secondPointer]) {
      if (isLastElementDiff(unionArray, arr1[firstPointer])) {
        unionArray.push(arr1[firstPointer]);
      }
      firstPointer++;
    } else {
      if (isLastElementDiff(unionArray, arr2[secondPointer])) {
        unionArray.push(arr2[secondPointer]);
      }
      secondPointer++;
    }
  }

  while (firstPointer < arr1.length) {
    if (isLastElementDiff(unionArray, arr1[firstPointer])) {
      unionArray.push(arr1[firstPointer]);
    }
    firstPointer++;
  }

  while (secondPointer < arr2.length) {
    if (isLastElementDiff(unionArray, arr2[secondPointer])) {
      unionArray.push(arr2[secondPointer]);
    }
    secondPointer++;
  }
  return unionArray;
};
// const numbers = [1, 1, 1, 2, 4, 5];
// const numbers2 = [2, 3, 4, 5, 6, 6, 7, 7];
// console.log(findUnionOfSortedArray(numbers, numbers2));

// Intersection of two sorted array
// Time (n + m) | Space O(min(n, m))
const findIntersectionOfSortedArray = (arr1, arr2) => {
  let firstPointer = 0;
  let secondPointer = 0;
  const intersection = [];

  while (firstPointer < arr1.length && secondPointer < arr2.length) {
    if (arr1[firstPointer] === arr2[secondPointer]) {
      intersection.push(arr1[firstPointer]);
      firstPointer++;
      secondPointer++;
      continue;
    }
    if (arr1[firstPointer] < arr2[secondPointer]) {
      firstPointer++;
    } else {
      secondPointer++;
    }
  }
  return intersection;
};
// const numbers = [1, 1, 2, 2, 3, 3, 4, 5, 6];
// const numbers2 = [2, 3, 3, 5, 5, 6, 7];
// console.log(findIntersectionOfSortedArray(numbers, numbers2));

// Find the missing number
// Time O(n) | Space O(1)
const findTheMissingNumber = (arr, numbers) => {
  // Time O(n^2) | Space O(1)
  // for (let i = 1; i <= numbers; i++) {
  //   let isNumberExist = true;
  //   for (let j = 0; j < arr.length; j++) {
  //     if (i === arr[j]) {
  //       isNumberExist = false;
  //       break;
  //     }
  //   }
  //   if (isNumberExist) return i;
  // }

  // Time O(2n) | Space O(n)
  // const hash = new Map();
  // for (let i = 1; i <= numbers; i++) {
  //   hash.set(i, 0);
  // }
  // for (let i = 0; i < arr.length; i++) {
  //   if (hash.get(arr[i]) === 0) {
  //     hash.set(arr[i], 1);
  //   }
  // }
  // for (const [key, value] of hash) {
  //   if (value === 0) {
  //     return key;
  //   }
  // }

  // Time O(n) | Space O(1)
  // const sum = (numbers * (numbers + 1)) / 2;
  // const total = arr.reduce((acc, curr) => (acc += curr), 0);
  // return sum - total;

  // Time O(n) | Space O(1)
  let xorFull = 0;
  let xorArr = 0;
  // XOR all numbers from 0 to n
  for (let i = 0; i <= numbers; i++) {
    xorFull ^= i;
  }
  // XOR all elements in array
  for (let num of arr) {
    xorArr ^= num;
  }
  // Missing number will be difference of XORs
  return xorFull ^ xorArr;
};
// const number = [1, 2, 4, 5];
// console.log(findTheMissingNumber(number, 5));

// Maximum consecutive of 1's
// Time O(n) | O(1)
const maximumConsecutiveOfOnes = (arr) => {
  let currentCount = 0;
  let maximum = 0;

  for (const num of arr) {
    if (num === 1) {
      currentCount++;
      maximum = Math.max(currentCount, maximum);
    } else {
      currentCount = 0;
    }
  }

  return maximum;
};
// const number = [1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1];
// console.log(maximumConsecutiveOfOnes(number));

// Find a number that appears once, other twice
// Time O(n) | Space O(1)
const findOnceAppearNumber = (arr) => {
  // Time O(n^2) | Space O(1)
  // for (const num of arr) {
  //   let count = 0
  //   for (const num2 of arr) {
  //     if (num === num2) {
  //       count++
  //     }
  //   }
  //   if (count === 1) {
  //     return num
  //   }
  // }

  // Time O(2n) | Space O(n/2 + 1)
  // const hash = new Map()
  // for(const num of arr){
  //   hash.set(num, (hash.get(num) || 0) + 1)
  // }
  // for (const [key, value] of hash) {
  //   if (value === 1) {
  //     return key
  //   }
  // }

  // Time O(n) | Space O(1)
  let xor = 0;
  for (const num of arr) {
    xor ^= num;
  }
  return xor;
};
// const number = [1, 1, 2, 3, 3, 4, 4, 5, 5];
// console.log(findOnceAppearNumber(number));

// Longest sub array with sum k
const longestSubArrayWithSumK = (arr, sum) => {
  // Time O(n^2) | Space O(1)
  // let length = 0;
  // for (let i = 0; i < arr.length; i++) {
  //   let currentSum = 0;
  //   for (let j = i; j < arr.length; j++) {
  //     // for (let k = i; k <= j; k++) {
  //     currentSum += arr[j];
  //     // }
  //     if (currentSum === sum) {
  //       length = Math.max(j - i + 1, length);
  //     }
  //   }
  // }
  // return length;

  const hash = new Map();
  let currentSum = 0;
  let maxLength = 0;
  for (let i = 0; i < arr.length; i++) {
    currentSum += arr[i];
    if (currentSum === sum) {
      maxLength = Math.max(maxLength.i + 1);
    }
    let remaining = currentSum - sum;
  }

  return maxLength;
};
const numberss = [1, 1, 2, 1, 1, 1, 1, 4, 2, 3];
console.log(longestSubArrayWithSumK(numberss, 3));

// Two sum
const towNumberSumWithTarget = (arr, target) => {
  // Time O(n^2) | Space O(1)
  // const pair = [-1, -1]
  // for (let i = 0; i < arr.length; i++) {
  //     for (let j = i + 1; j < arr.length; j++) {
  //         if (arr[j] + arr[i] === target) {
  //             return [arr[j], arr[i]];
  //         }
  //     }
  // }

  // Time O(n lon n) | Space O(n^2)
  // const hashMap = new Map();
  // for (let i = 0; i < arr.length; i++) {
  //     const need = target - arr[i];
  //     if (hashMap.has(need)) {
  //         return [hashMap.get(need), i];
  //     }
  //     hashMap.set(arr[i], i);
  //     console.log(hashMap);
  // }

  // Time O(n) + O(n log n) | Space O(1)
  let leftPointer = 0;
  let rightPointer = arr.length - 1;
  arr = arr.sort((a, b) => a - b);
  while (leftPointer < target) {
    if (arr[leftPointer] + arr[rightPointer] === target) {
      return [leftPointer, rightPointer];
    }
    if (arr[leftPointer] + arr[rightPointer] > target) {
      rightPointer--;
    } else {
      leftPointer++;
    }
  }
};

const number = [2, 6, 5, 8, 11];
console.log(towNumberSumWithTarget(number, 14));

// TODO: Sort an array of 0's 1's & 2's | Intuition of Algo🔥
