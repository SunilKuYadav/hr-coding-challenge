const input = [7, 10, 4, 3, 20, 15, 5, 7, 0, 34, 12, -2, -34]

// Time O(nlogn)
// Space O(k)
const kMaxAndMin = (arr, k) => {
    // sort the array in O(nlogn)
    arr.sort((a, b) => a - b);
    // length of array
    const len = arr.length - 1;

    // return starting k element and ending k element
    return [arr.slice(0, k), arr.slice(len - k, len)]
}

// Time O(nlogn)
// Space O(1)
const kthMaxAndMin = (arr, k) => {
    // sort the array in O(nlogn)
    arr.sort((a, b) => a - b);
    // length of array
    const len = arr.length - 1;

    // return starting kth element and ending kth element
    return [arr[k - 1], arr[len - k]]
}

const out = kMaxAndMin(input, 4);
const out1 = kthMaxAndMin(input, 4);

console.log("Input : ", input);
console.log("k smallest number : ", out[0]);
console.log("k largest number : ", out[1]);
console.log("kth smallest number : ", out1[0]);
console.log("kth largest number : ", out1[1]);