// How are duplicates removed from a given array in JavaScript ?

const input = [1, 2, 2, 3, 5, 6, 7, 8, 8, 8, 9, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// Time O(n^2)
// Space O(n)
const removerDuplicate = (arr) => {
    const len = arr.length;
    const resultentArr = [];

    for (let i = 0; i < len; i++) {
        if (!resultentArr.includes(arr[i])) {
            resultentArr.push(arr[i])
        };
    }
    return resultentArr;
}

const removerDuplicate1 = (arr) => {
    return [... new Set(arr)];
}

const out = removerDuplicate(input);
const out1 = removerDuplicate1(input);
console.log(out);
console.log(out1);