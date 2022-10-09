
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function (nums, target) {
    for (let left = 0; left < nums.length; left++) {
        for (let right = left + 1; right < nums.length; right++) {
            if (nums[left] + nums[right] === target) {
                return [left, right]
            }
        }
    }
    return [-1, -1]
};