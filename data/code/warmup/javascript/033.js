// How do you find all the permutations of a string ?
// A permutation also called an “arrangement number” or “order,” is a rearrangement of the elements of an ordered list S into a one - to - one correspondence with S itself.A string of length N has N! permutations. 

// const input = "123456789"; // 1.6sec
const input = "123456789*"; // 16 sec => 3628799 permutaion
// Time 10 * 10! => 36288000

let count = 0;

const swap = (str, left, right) => {
    let charArray = str.split("");

    const temp = charArray[left];
    charArray[left] = charArray[right];
    charArray[right] = temp;

    return charArray.join("")
}


// Time O(n * n!) => (time to print one permutation * number of permutation)
// Space O()

// Create a function permute() with parameters as input string, starting index of the string, ending index of the string
// Call this function with values input string, 0, size of string – 1
// In this function, if the value of  L and R is the same then print the same string
//      Else run a for loop from L to R and swap the current element in the for loop with the inputString[L]
//      Then again call this same function by increasing the value of L by 1
//      After that again swap the previously swapped values to initiate backtracking
(allPermutations = (str, left, right) => {

    if (left === right) {
        console.log(count++, str)
    } else {
        for (let i = left; i <= right; i++) {
            str = swap(str, left, i);
            allPermutations(str, left + 1, right);
            str = swap(str, left, i)
        }
    }
})(input, 0, input.length - 1)


