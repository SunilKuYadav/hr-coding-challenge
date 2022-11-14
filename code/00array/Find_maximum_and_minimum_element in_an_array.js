const input = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Time O(n)
// Space O(1)
const minAndMax = (arr) => {
    // define two variable to hold min and max
    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;

    // array length
    const len = arr.length;

    // if array length is 0 then return [-1, -1]
    if (len === 0) return [-1, -1];

    // loop over the array
    for (let index = 0; index < len; index++) {
        // check if current array item is less then min
        if (min > arr[index]) {
            min = arr[index];
        }

        // check if current array item is greater then max
        if (max < arr[index]) {
            max = arr[index];
        }
    }
    // return [min, max]
    return [min, max]
}

// Time O(n)
// Space O(1)
const secondMinAndMax = (arr) => {
    // define four variable to hold 1st and 2nd minMax
    let firstMin = Number.MAX_SAFE_INTEGER;
    let secondMin = Number.MAX_SAFE_INTEGER;
    let firstMax = arr[0];
    let secondMax = Number.MIN_SAFE_INTEGER;

    // length of array
    const len = arr.length;

    // check for lower bound and return [-1, -1]
    if (len < 2) {
        return [-1, -1]
    }
    for (let index = 0; index < len; index++) {
        // check if current element is greater then firstMax
        if (arr[index] > firstMax) {
            secondMax = firstMax;
            firstMax = arr[index]
        }
        // check if current element is in beteen firstMax and secondMax
        else if (arr[index] > secondMax && arr[index] < firstMax) {
            secondMax = arr[index]
        }

        // check if current element is lower then firstMin
        if (arr[index] < firstMin) {
            secondMin = firstMin;
            firstMin = arr[index]
        }
        // check if current element is lower then secondMin and not equal to firstMin
        else if (arr[index] < secondMin && arr[index] !== firstMin) {
            secondMin = arr[index]
        }
    }
    return [secondMin, secondMax]


}

// Time O(n)
// Space O(1)
const thirdMinAndMax = (arr) => {
    // define six variable to hold 1st, 2nd and 3rd minMax
    let firstMin = Number.MAX_SAFE_INTEGER;
    let secondMin = Number.MAX_SAFE_INTEGER;
    let thirdMin = Number.MAX_SAFE_INTEGER;
    let firstMax = arr[0];
    let secondMax = Number.MIN_SAFE_INTEGER;
    let thirdMax = Number.MIN_SAFE_INTEGER;

    // length of array
    const len = arr.length;

    // check for lower bound and return [-1, -1]
    if (len < 3) {
        return [-1, -1]
    }
    for (let index = 0; index < len; index++) {
        // check if current element is greater then firstMax
        if (arr[index] > firstMax) {
            thirdMax = secondMax;
            secondMax = firstMax;
            firstMax = arr[index];
        }
        // check if current element is in between first and secondMax
        else if (arr[index] > secondMax && arr[index] < firstMax) {
            thirdMax = secondMax;
            secondMax = arr[index];
        }
        // check is current element is greater then thirdMax
        else if (arr[index] > thirdMax) {
            thirdMax = arr[index];
        }

        // check if current element is lower then firstMin
        if (arr[index] < firstMin) {
            thirdMin = secondMin;
            secondMin = firstMin;
            firstMin = arr[index];
        }
        // check if current element is lower then secondMin and not equal to firstMin
        else if (arr[index] < secondMin && arr[index] !== firstMin) {
            thirdMin = secondMin;
            secondMin = arr[index];
        }
        // check if current element is lower then thirdMin
        else if (arr[index] < thirdMin) {
            thirdMin = arr[index];
        }
    }
    return [thirdMin, thirdMax]


}


const out = minAndMax(input);
const out2 = secondMinAndMax(input);
const out3 = thirdMinAndMax(input);

console.log("Input : ", input);
console.log("Min and Max : ", out);
console.log("Second min and max : ", out2)
console.log("Third min and max : ", out3)