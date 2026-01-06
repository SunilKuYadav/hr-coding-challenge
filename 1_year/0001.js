/** ✅ Problem 1 (Warm-up)

Problem: Two Sum
Goal:

Understand hash map usage
Explain time & space trade-offs

👉 After solving, be able to answer:
Why hash map?
What if array is sorted?

Can you do better than O(n)?


// nums = [2, 7, 11, 15]
// target = 9
// output = [0, 1]
*/

// Time Complexity: O(n)
// Space Complexity: O(n)
const twoSum = (nums, target) => {

  // I use a hash map to store numbers I’ve already seen along with their indices
  const numMap = new Map();

  // I iterate once through the array, so time complexity is linear.
  for (let i = 0; i < nums.length; i++) {

    // For each number, I calculate the complement needed to reach the target.
    const complement = target - nums[i];

    // If the complement already exists in the map, I’ve found the solution and return the indices.
    if (numMap.has(complement)) {
      return [numMap.get(complement), i];
    }
    // Otherwise, I store the current number and its index for future lookups.
    numMap.set(nums[i], i);
  }
  // This handles the case where no solution exists, though in the classic problem one is guaranteed.
  return null;
};

// Why not use two pointers?
// Two pointers require a sorted array. Since sorting changes indices and adds O(n log n) time, a hash map is better for unsorted input.

// Why store before checking?
// If I store before checking, I might accidentally use the same element twice. Checking first avoids that.

// What about duplicates?
// This solution handles duplicates correctly because indices are stored, not values.

// console.log(twoSum([2, 7, 11, 15], 9));
// console.log(twoSum([3, 2, 4], 6));
// console.log(twoSum([3, 3], 6));
// console.log(twoSum([-1, -2, -3, -4, -5], -8));
// console.log(twoSum([0, 4, 3, 0], 0));
// console.log(twoSum([1, 5, 7, 8, 9, 2], 10));


/**
📌 Problem Statement (Simple Words)

You are given an array where:

prices[i] = stock price on day i

You are allowed only one buy and one sell

You must buy before you sell

👉 Return the maximum profit
👉 If no profit is possible, return 0
prices = [7, 1, 5, 3, 6, 4]
5

 */

// Time Complexity: O(n)
// Space Complexity: O(1)
const maxProfit = (prices) => {
  // I track the minimum stock price seen so far and the maximum profit achievable till the current day.
  let minPrice = prices[0];
  let profit = 0;
  
  // I start from day 1 because buying and selling on the same day gives zero profit.
  for (let i = 1; i < prices.length; i++) {
    // At each day, I update the minimum buying price seen so far.
    minPrice = Math.min(minPrice, prices[i]);

    // I assume today is the selling day and calculate the best profit possible.
    profit = Math.max(profit, prices[i] - minPrice);
  }
  // If no profitable transaction exists, the result remains 0.
  return profit;
};

// console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5
// console.log(maxProfit([7, 6, 4, 3, 1])); // 0
// console.log(maxProfit([1, 2])); // 1
// console.log(maxProfit([2, 4, 1])); // 2



// Day 1 — System Design (FOUNDATION)

// 1. Clarify requirements
// 2. Define scope (what is in / out)
// 3. High-level architecture
// 4. Deep dive into 1–2 critical components
// 5. Trade-offs & bottlenecks


// ✍️ Write Your Day-1 Notes Like This (Simple & Interview-Ready)

// You can literally write something like this in your notes:

// 🧩 My System Design Approach

/**
First, I clarify functional and non-functional requirements
I define the scope to avoid over-engineering
I start with a high-level architecture (major components)
Then I deep dive into the most critical part
Finally, I discuss trade-offs, scalability, and failure cases
*/

// Before jumping into the solution, I’d like to clarify requirements and constraints so we design the right system.

// Structure and clarity matter more than tools in system design.