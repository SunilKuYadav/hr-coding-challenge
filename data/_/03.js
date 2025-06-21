// find multiplication of all element except index element
const input1 = [1, 2, 3, 4, 5]; // Output: [ 120, 60, 40, 30, 24 ]
const input2 = [1, 2, 3, 4, 0]; // Output: [ 0, 0, 0, 0, 24 ]
const input3 = [1, 2, 3, 0, 0]; // Output: [ 0, 0, 0, 0, 0 ]

// Time O(n^2)
// Space O(n)
const multiplication = arr => {
    // arr for holding result
    const res = [...arr];

    // variable for counting zero
    let countZero = 0;
    for (let i = 0; i < arr.length; i++) {
        // update zero count
        if (arr[i] === 0) {
            countZero++;
        }
        let tempMul = 1;
        for (let j = 0; j < arr.length; j++) {
            if (i === j) continue;
            tempMul *= arr[j];
        }
        // update multiple at index
        res[i] = tempMul;

        // base condition if we have one zero
        if (countZero === 1) {
            res.fill(0);
            res[i] = tempMul
            break
        }
        // base condition if we have two zero
        if (countZero === 2) {
            res.fill(0);
            break
        }
    }
    return res;
}

// Time O(n)
// Space O(1)
const multiplicationSecond = arr => {

    // variable for counting zero
    let countZero = 0;
    let totalMul = 1;

    for (let i = 0; i < arr.length; i++)
        if (arr[i] === 0) {
            countZero++;
            if (countZero === 2) break;
        } else {
            totalMul *= arr[i];
        }

    if (countZero === 1) {
        for (let i = 0; i < arr.length; i++)
            (arr[i] === 0) ? arr[i] = totalMul : arr[i] = 0
    } else if (countZero === 2) {
        arr.fill(0);
    } else {
        for (let i = 0; i < arr.length; i++) arr[i] = totalMul / arr[i];
    }

    return arr;
}

console.log(multiplicationSecond(input1))
console.log(multiplicationSecond(input2))
console.log(multiplicationSecond(input3))