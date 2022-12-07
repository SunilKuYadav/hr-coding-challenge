// How do you check if two strings are anagrams of each other ?
// An anagram of a string is another string that contains the same characters, only the order of characters can be different.For example, “abcd” and “dabc” are an anagram of each other.

const input1 = "ramismyhero";
const input2 = "heroismyram";

// Time O(nlogn)
// Space O(1)

const checkAnagrams = (str1, str2) => {
    // get the length of both strings
    const len1 = str1.length;
    const len2 = str2.length;

    // check for base case
    if (len1 !== len2) {
        return false
    }

    // sort both string
    str1 = str1.split("").sort().join("");
    str2 = str2.split("").sort().join("");

    // loop and check for both array have common char
    for (let i = 0; i < len1; i++) {
        if (str1[i] !== str2[i]) {
            return false
        }
    }

    return true
}

// Time O(n)
// Space O(256)
// const checkAnagrams = (str1, str2) => {
//     // possible ASCCI values
//     const NO_OF_CHAR = 256;

//     // taking two arrays for holding all chars and it count
//     const count1 = new Array(NO_OF_CHAR);
//     const count2 = new Array(NO_OF_CHAR);

//     // fill intially all element as 0
//     count1.fill(0);
//     count2.fill(0);

//     // checking for base case if length is not equal
//     if (str1.length !== str2.length) {
//         return false;
//     }

//     // update char count to respective arrays
//     for (let i = 0; i < str1.length && str2.length; i++) {
//         count1[str1.charCodeAt(i)]++;
//         count2[str2.charCodeAt(i)]++;
//     }

//     // checking for both array should have equal number of chars
//     for (let i = 0; i < NO_OF_CHAR; i++) {
//         if (count1[i] !== count2[i]) {
//             return false;
//         }
//     }
//     return true;
// }

// Time O(n)
// Space O(1)
// const checkAnagrams = (str1, str2) => {
//     // check if legnth in not equal
//     if (str1.length !== str2.length) {
//         return false;
//     }

//     // create new hash table
//     const hash = new Map();

//     // loop over first string
//     for (let i = 0; i < str1.length; i++) {
//         // check if srt[i] is exixt in hash table
//         if (hash.has(str1[i])) {
//             // update count by one
//             hash.set(str1[i], hash.get(str1[i]) + 1);
//         } else {
//             // add char to hash table
//             hash.set(str1[i], 1);
//         }
//     }

//     // loop over second string
//     for (let i = 0; i < str2.length; i++) {
//         // check if str[i] is exist in hash table
//         if (hash.has(str2[1])) {
//             // decremet the count by 1
//             hash.set(str2[i], hash.get(str2[i]) - 1);
//         } else {
//             // return not anagram
//             return false
//         }
//     }

//     // get all keys of hash table and loop over it
//     const keys = hash.keys();

//     for (let key in keys) {
//         // check all keys count should be zero in hash table
//         if (hash.get(key) !== 0) {
//             return false;
//         }
//     }

//     return true;
// }


const out1 = checkAnagrams(input1, input2);
console.log(`${input1} and ${input2} are anagrams : ${out1}`)