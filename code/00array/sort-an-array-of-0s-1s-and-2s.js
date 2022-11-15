const input = [0, 1, 1, 0, 1, 2, 1, 2, 0, 0, 0, 1];

// Time O(n)
// Space O(1)
// Using Dutch National Flag algorithm
const sort = (arr) => {
    // define low, mid and high variable
    let low = 0;
    let mid = 0;
    let high = arr.length - 1;

    while (mid <= high) {
        // if element is 0 then swap low vs min and increase low and high by 1
        if (arr[mid] === 0) {
            const temp = arr[low];
            arr[low] = arr[mid];
            arr[mid] = temp;
            low += 1;
            mid += 1;
        } else if (arr[mid] === 1) { // if element is 1 then increase min by 1
            mid += 1;
        } else { // else element will be 2 so swap mid vs high and decrease high by 1
            const temp = arr[high];
            arr[high] = arr[mid];
            arr[mid] = temp;
            high -= 1;
        }
    }
    return arr;
}

const out = sort(input);
console.log("Input : ", input);
console.log("Sorted : ", out);