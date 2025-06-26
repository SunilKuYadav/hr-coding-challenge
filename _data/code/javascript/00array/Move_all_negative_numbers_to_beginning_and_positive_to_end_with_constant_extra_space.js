const input = [1, -3, 2, 4, 76, 234, -34, -4, 4, 2, 6, -4];

// Time O(n)
// Space O(1)
// using Dutch National Flag Algorithm
const seperateNegativeAndPositive = (arr) => {
    let low = 0;
    let high = arr.length - 1;

    while (low <= high) {
        if (arr[low] < 0) {
            low += 1;
        } else if (arr[high] > 0) {
            high -= 1;
        } else {
            let temp = arr[low];
            arr[low] = arr[high];
            arr[high] = temp;
        }
    }
    return arr;
}

const out = seperateNegativeAndPositive(input);
console.log("Input : ", input)
console.log("Output : ", out);