
const input = [1, 2, 3, 4, 5, 6, 7, 8, 9]

// time O(n)
// Space O(n)
const reverseArray = (arr) => {
    const len = arr.length - 1;
    const reverseArr = [];
    if (len === -1) return []
    for (let index = len; index >= 0; index--) {
        reverseArr.push(arr[index]);
    }
    return reverseArr;
}

const out = reverseArray(input);
console.log(out);