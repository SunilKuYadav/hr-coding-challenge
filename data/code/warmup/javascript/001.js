// How is a bubble sort algorithm implemented ?

const input1 = [2, 4, 1, 5, 6, 9, 1, 5, 7, 7];
const input2 = [9, 1, 3, 9, 3, 6, 8, 3, 8, 1, 6, 9];

// Time O(n^2)
// Space O(1)
const bubbleSort = (arr) => {
    // length of array
    const len = arr.length;
    // a boolean varible for checking if array is alraedy sorted
    let swap = false;
    // loop over array 0 to len - 1
    for (let i = 0; i < len - 1; i++) {
        // consider that array is sorted
        swap = false;

        // loop over array for internal comparision and swapping
        // 0 - len - i -1
        for (let j = 0; j < len - i - 1; j++) {
            // check if j and j+1 element is following the order
            if (arr[j] > arr[j + 1]) {
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;

                // array is not sorted so assign swap to be true
                swap = true;
            }
        }
        // check if array is aready sorted and break the loop
        if (!swap) {
            break;
        }
    }

    // return sorted array
    return arr;
}

// Time O(n^2)
// Space O(1)
const bubbleSortRev = (arr) => {
    // length of array
    const len = arr.length;
    // a boolean varible for checking if array is alraedy sorted
    let swap = false;
    // loop over array 0 to len - 1
    for (let i = 0; i < len - 1; i++) {
        // consider that array is sorted
        swap = false;
        // loop over array for internal comparision and swapping
        // 0 - len - i -1
        for (let j = 0; j < len - i - 1; j++) {
            // check if j and j+1 element is following the order
            if (arr[j] < arr[j + 1]) {
                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                // array is not sorted so assign swap to be true
                swap = true;
            }
        }
        // check if array is aready sorted and break the loop
        if (!swap) {
            break;
        }
    }

    // return sorted array
    return arr;
}

const out1 = [...bubbleSort(input1)];
const out2 = [...bubbleSort(input2)];

const out3 = [...bubbleSortRev(input1)];
const out4 = [...bubbleSortRev(input2)];

console.log("sort : ", out1)
console.log("reverse sort : ", out3)
console.log("sort : ", out2)
console.log("reverse sort : ", out4)