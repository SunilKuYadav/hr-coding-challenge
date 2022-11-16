const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

// Time O(n)
// Space O(1)
// using two pointer
const rotateByOne = (arr) => {
    let start = 0;
    let end = arr.length - 1;
    while (start != end) {
        const temp = arr[start];
        arr[start] = arr[end];
        arr[end] = temp;
        start += 1;
    }
    return arr;
}

const out = rotateByOne(input);

console.log("Input array : ", input);
console.log("After rotate by one : ", out)