# https://leetcode.com/problems/two-sum/

# A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it's best to try out brute force solutions for just for completeness. It is from these brute force solutions that you can come up with optimizations.
# So, if we fix one of the numbers, say x, we have to scan the entire array to find the next number y which is value - x where value is the input parameter. Can we change our array somehow so that this search becomes faster?
# The second train of thought is, without changing the array, can we use additional space somehow? Like maybe a hash map to speed up the search?

# Time = O(n^2)
# Space = O(1)
def towNumberSum(self, nums, target):
    for left in range(len(nums)):
        for right in range(left+1, len(nums)):
            if nums[left] + nums[right] == target:
                return [left, right]
    return [-1,-1]

# Time = O(nlogn)
# Space = O(1)
# only applicable when you have to return nums
def twoSum(self, nums, target):
        nums.sort()
        left = 0
        right = len(nums) - 1
        while(left < right):
            currentSum = nums[left] + nums[right]
            if(currentSum == target):
                return [left, right]
            elif currentSum < target:
                left += 1
            elif currentSum > target:
                right -= 1
        
                
# Time = O(n)
# Space = O(n)
def towNumberSum(self, nums, target):
    hash = {}
    for index in range(len(nums)):
        potentialMatch = target - nums[index]
        if potentialMatch in hash:
            return [hash[potentialMatch], index]
        else:
                hash[nums[index]] = index