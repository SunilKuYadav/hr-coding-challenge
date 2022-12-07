// How is a merge sort algorithm implemented ?

const input1 = [38, 27, 43, 3, 9, 82, 10];
const input2 = [9, 1, 3, 9, 3, 6, 8, 3, 8, 1, 6, 9];


// Merges two subarrays of arr[]. First subarray is arr[l..m] and Second subarray is arr[m+1..r]
// Time O(n)
// Space O(n)
const merge = (arr, left, middle, right) => {
    // left array and right array length
    const leftArrayLength = middle - left + 1;
    const rightArrayLength = right - middle;

    // temp left array and its values
    const leftArray = [];
    for (let i = 0; i < leftArrayLength; i++) {
        leftArray[i] = arr[left + i];
    }

    // temp right array and its values
    const rightArray = [];
    for (let j = 0; j < rightArrayLength; j++) {
        rightArray[j] = arr[middle + 1 + j];
    }

    // merge the temp arrays back into arr[l..r]
    // intial index of first and second subarrays
    let i = 0,
        j = 0,
        // intial index of merged array
        k = left;

    while (i < leftArrayLength && j < rightArrayLength) {
        if (leftArray[i] <= rightArray[j]) {
            arr[k] = leftArray[i];
            i++;
        } else {
            arr[k] = rightArray[j];
            j++;
        }
        k++;
    }

    // copy the remaining elements of leftArray[] if there are any
    while (i < leftArrayLength) {
        arr[k] = leftArray[i];
        i++;
        k++;
    }
    // copy the remaining elements of rightArray[] if there are any
    while (j < rightArrayLength) {
        arr[k] = rightArray[j];
        j++;
        k++;
    }
}

// Time O(nlogn)
// Space O(1)
const mergeSort = (arr, left, right) => {
    if (left >= right) {
        return;
    };
    const middle = left + parseInt((right - left) / 2);
    mergeSort(arr, left, middle);
    mergeSort(arr, middle + 1, right);
    merge(arr, left, middle, right);
}


(mergeSortDriver = () => {
    mergeSort(input1, 0, input1.length - 1);
    console.log("sorted : ", input1);
})();