
const input1 = [7, 1, 5, 2, 3, 6]
const input2 = [3, 8, 6, 20, 7]

const input3 = [2, 5, 6]
const input4 = [4, 6, 8, 10]

// check if both array have common value (one or more)
// Time O(n)
// Space O(n)
const haveSameElement = (arr1, arr2) => {
    // create a object to hold {value: boolean}
    const obj = {};

    let minLengthArray;
    let maxLengthArray;

    // update array according lenght to reduce the space
    if (arr1.length > arr2.length) {
        minLengthArray = arr2;
        maxLengthArray = arr1;
    } else {
        minLengthArray = arr1;
        maxLengthArray = arr2;
    }

    // loop over arr1 and assign to object
    minLengthArray.forEach(value => {
        if (!obj[value]) { // check for duplicate value
            obj[value] = true;
        }
    })
    // loop over the arr2 and if we find value in object return true else false
    return maxLengthArray.some(value => obj[value])
}

// Time O(max(n,m))
// Space O()
const sortedArrayUnionAndIntersection = (arr1, arr2) => {
    let firstArrayPointer = 0;
    let secondArrayPointer = 0;
    let minLengthArray;
    let maxLengthArray;

    // update array according lenght to reduce the space
    if (arr1.length > arr2.length) {
        minLengthArray = arr2;
        maxLengthArray = arr1;
    } else {
        minLengthArray = arr1;
        maxLengthArray = arr2;
    }

    // result holder of intersection and union
    const intersection = [];
    const union = [];

    // loop over max length array


    return [union, intersection];
}


// unsorted arrays
const out = haveSameElement(input1, input2);
console.log("First array : ", input1);
console.log("Second array : ", input2);
console.log("Arrays have common values : ", out);
console.log("Intersection : ");
console.log("Union : ")


// sorted arrays
const out3 = haveSameElement(input3, input4);
const out4 = sortedArrayUnionAndIntersection(input3, input4);
console.log("First array : ", input3);
console.log("Second array : ", input4);
console.log("Arrays have common values : ", out3);
console.log("Union : ", out4[0])
console.log("Intersection : ", out4[1]);