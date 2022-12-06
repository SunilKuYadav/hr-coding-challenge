// How do you reverse an array in place in JavaScript

const input1 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const input2 = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Time O(n)
// Space O(1)
const reverse1 = (arr) => {
    let len = arr.length - 1;
    let middle = Math.floor(len / 2);

    for (let i = 0; i < middle; i++) {
        const temp = arr[len - i];
        arr[len - i] = arr[i];
        arr[i] = temp;
    }
    return arr;
}
const reverse2 = (arr) => {
    return arr.reverse();
}

const out1 = reverse1(input1);
const out2 = reverse2(input2);

console.log(out1);
console.log(out2);