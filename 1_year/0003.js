// Maximum Average Subarray I

// Input: nums = [1,12,-5,-6,50,3], k = 4
// Output: 12.75
// Explanation: Subarray [12, -5, -6, 50] has the maximum average.

// Time Complexity: O(n)
// Space Complexity: O(1)
const findMaxAverage = (nums, k) => {
  let currentSum = 0;

  // first window
  for (let i = 0; i < k; i++) {
    currentSum += nums[i];
  }

  let maxSum = currentSum;

  // sliding window
  for (let i = k; i < nums.length; i++) {
    // add right element and remove left element
    currentSum += nums[i] - nums[i - k];
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum / k;
};

// console.log(findMaxAverage([1, 12, -5, -6, 50, 3], 4)); // Output: 12.75
// console.log(findMaxAverage([-5, -4, -3], 2)); // Output: -3.5

// Longest Substring Without Repeating Characters
// Input:  "abcabcbb"
// Output: 3
// Explanation: "abc"

// Input: "bbbbb"
// Output: 1
// Explanation: "b"

// Input: "pwwkew"
// Output: 3
// Explanation: "wke"

// Time Complexity: O(n)
// Space Complexity: O(min(n, m)) => O(min(n, charset)) → effectively O(n)
const lengthOfLongestSubstring = (s) => {
  let charMap = new Map();
  let left = 0;
  let maxLength = 0;

  for (let right = 0; right < s.length; right++) {
    if (charMap.has(s[right])) {
      left = Math.max(left, charMap.get(s[right]) + 1);
    }
    charMap.set(s[right], right);
    maxLength = Math.max(maxLength, right - left + 1);
  }

  return maxLength;
};

// console.log(lengthOfLongestSubstring("abcabcbb")); // Output: 3
// console.log(lengthOfLongestSubstring("bbbbb")); // Output: 1
// console.log(lengthOfLongestSubstring("pwwkew")); // Output: 3

// Minimum Window Substring
// Statement
// Given two strings s and t, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.
// If no such window exists, return "".

// Input:  s = "ADOBECODEBANC", t = "ABC"
// Output: "BANC"

// Input: s = "a", t = "a"
// Output: "a"

// Input: s = "a", t = "aa"
// Output: ""

// Time Complexity: O(n)
// Space Complexity: O(min(n, m))
// Time: O(|s| + |t|)
// Space: O(|s| + |t|) (maps)
const minWindow = (s, t) => {
  if (!s || !t) return "";

  let charCount = new Map();
  for (let char of t) {
    charCount.set(char, (charCount.get(char) || 0) + 1);
  }

  let required = charCount.size;
  let left = 0;
  let right = 0;
  let formed = 0;
  let minLength = Infinity;
  let minLeft = 0;

  let windowCounts = new Map();

  while (right < s.length) {
    let char = s[right];
    windowCounts.set(char, (windowCounts.get(char) || 0) + 1);

    if (charCount.has(char) && windowCounts.get(char) === charCount.get(char)) {
      formed++;
    }

    while (left <= right && formed === required) {
      char = s[left];

      if (right - left + 1 < minLength) {
        minLength = right - left + 1;
        minLeft = left;
      }

      windowCounts.set(char, windowCounts.get(char) - 1);
      if (charCount.has(char) && windowCounts.get(char) < charCount.get(char)) {
        formed--;
      }

      left++;
    }

    right++;
  }

  return minLength === Infinity
    ? ""
    : s.substring(minLeft, minLeft + minLength);
};

// console.log(minWindow("ADOBECODEBANC", "ABC")); // Output: "BANC"
// console.log(minWindow("a", "a")); // Output: "a"
// console.log(minWindow("a", "aa")); // Output: ""
