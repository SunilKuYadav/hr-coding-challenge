// find duplicate

// Time: O(n)
// Space: O(n)
const isDuplicate = (arr) => {
  const seen = new Set();
  for (let i = 0; i < arr.length; i++) {
    if (seen.has(arr[i])) {
      return true;
    }
    seen.add(arr[i]);
  }
  return false;
}
// One-Line Trick (Interview Bonus)
const containDuplicate = arr => new Set(arr).size !== arr.length;

// console.log(isDuplicate([1, 2, 3, 4])); // false
// console.log(isDuplicate([1, 2, 3, 4, 2])); // true

// Can we do it without extra space?
// Yes, by sorting → O(n log n) time, O(1) space (if allowed)
const isDuplicateSorted = (arr) => {
  arr.sort((a, b) => a - b);
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === arr[i - 1]) {
      return true;
    }
  }
  return false;
}

// console.log(isDuplicateSorted([1, 2, 3, 4])); // false
// console.log(isDuplicateSorted([1, 2, 3, 4, 2])); // true

// if Array is sorted
// Time: O(n)
// Space: O(1) ✅ (best possible)
const containsDuplicate = (arr) => {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === arr[i - 1]) {
      return true;
    }
  }
  return false;
};
// Since the array is already sorted, duplicates—if present—must appear next to each other.
// So we can solve this in O(n) time and O(1) space by checking adjacent elements

// console.log(isDuplicateSorted([1, 2, 3, 4])); // false
// console.log(isDuplicateSorted([1, 2, 3, 4, 2])); // true


// ====================================================================================================================================

// Check for anagrams
// Time: O(n)
// Space: O(1) (only 26 letters if lowercase English)
const isAnagram = (word1, word2) => {
  if (word1.length !== word2.length) return false;
  const count = {};

  for (let char of word1) {
    count[char] = (count[char] || 0) + 1;
  }

  for (let char of word2) {
    count[char] = (count[char] || 0) - 1;
  }

  for (let key in count) {
    if (count[key] !== 0) return false;
  }
  return true;
}

// Time: O(n log n)
const isAnagramSorted = (word1, word2) => {
  if (word1.length !== word2.length) return false;
  const sorted1 = word1.split("").sort().join("");
  const sorted2 = word2.split("").sort().join("");
  return sorted1 === sorted2;
}

// console.log(isAnagram("listen", "silent")); // true
// console.log(isAnagram("hello", "world"));   // false

// console.log(isAnagramSorted("listen", "silent")); // true
// console.log(isAnagramSorted("hello", "world"));   // false

// 🧩 Problem: Move Zeroes
// Time: O(n)
// Space: O(1)
const moveZeroes = (arr) => {
  let lastNonZeroIndex = 0;

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== 0) {
      arr[lastNonZeroIndex] = arr[i];
      lastNonZeroIndex++;
    }
  }

  for (let i = lastNonZeroIndex; i < arr.length; i++) {
    arr[i] = 0;
  }

  return arr;
}
// I used two pointers to move non-zero elements forward in-place, preserving order and achieving O(1) space.

console.log(moveZeroes([0, 1, 0, 3, 12])); // [1, 3, 12, 0, 0]
console.log(moveZeroes([0, 0, 1]));         // [1, 0, 0]