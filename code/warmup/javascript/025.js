// How do you implement an insertion sort algorithm?

const input1 = [2, 4, 1, 5, 6, 9, 1, 5, 7, 7];
const input2 = [9, 1, 3, 9, 3, 6, 8, 3, 8, 1, 6, 9];

// Time O(n)
// Space O(1)
const insertionSort = (arr) => {
  const len = arr.length;
  let i, j, key;
  for (i = 1; i < len; i++) {
    key = arr[i];
    j = i - 1;

    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j -= 1;
    }
    arr[j + 1] = key;
  }
  return arr;
};
const insertionSortRev = (arr) => {
  const len = arr.length;
  let i, j, key;
  for (i = 1; i < len; i++) {
    key = arr[i];
    j = i - 1;

    while (j >= 0 && arr[j] < key) {
      arr[j + 1] = arr[j];
      j -= 1;
    }
    arr[j + 1] = key;
  }
  return arr;
};

// driver code
const out1 = [...insertionSort(input1)];
const out2 = [...insertionSort(input2)];

const out3 = [...insertionSortRev(input1)];
const out4 = [...insertionSortRev(input2)];

console.log("sort : ", out1);
console.log("reverse sort : ", out3);
console.log("sort : ", out2);
console.log("reverse sort : ", out4);
