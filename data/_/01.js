// find all posible pair of target sum

// input [1, 2, 3, 4, 5, 6, 7]
// expected sum of two no = 9

// expected output
// 7, 2
// 6, 3
// 5, 4

const input = [1, 2, 3, 4, 5, 6, 7];
const targetSum = 9;

// first approch
// Time O(n^2)
// Space O(1)
const findAllPairOfTargetSum = (arr, target) => {
    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] + arr[j] === target) {
                console.log(`${arr[i]} +  ${arr[j]} =  ${target}`);
            }
        }
    }
}

// second approch
// a + b = targetSum
// targetSum - b = 

// Time O(n)
// Space O(n)
const findAllPairOfTargetSumSecond = (arr, target) => {

    // hash table for holding {expectedValue: index}
    const hash = new Map();

    for (let i = 0; i < arr.length; i++) {
        if (hash.has(arr[i])) {
            console.log(`${arr[i]} +  ${target - arr[i]} =  ${target}`);
            hash.delete(target - arr[i]);
        } else {
            hash.set(target - arr[i], i)
        }
    }
}


// findAllPairOfTargetSum(input, targetSum)
findAllPairOfTargetSumSecond(input, targetSum)
