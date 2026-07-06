// Subarray Sum Equals K
// Statement

// Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals k.

// Input: nums = [1,1,1], k = 2
// Output: 2

// Input: nums = [1,2,3], k = 3
// Output: 2


const subarraySum = (nums, k) => {
  let count = 0;
  let sum = 0;
  let sumMap = new Map();
  sumMap.set(0, 1);

  console.log(count, sum, sumMap)



  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
    if (sumMap.has(sum - k)) {
      count += sumMap.get(sum - k);
    }
    sumMap.set(sum, (sumMap.get(sum) || 0) + 1);

  console.log(count, sum, sumMap)

  }

  return count;
};

console.log(subarraySum([1, 1, 1], 2)); // Output: 2
console.log(subarraySum([1, 2, 3], 3)); // Output: 2