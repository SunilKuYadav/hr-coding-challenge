// How do you print the first non - repeated character from a string

const input1 = "ramramjaishreeram";
const input2 = "helloDearHowAreYouDoing";

// Time O(n^2)
// Space O(1)
const firstOccurrenceOfCharacter = (str) => {
    for (let i = 0; i < str.length; i++) {
        if (str.indexOf(str.charAt(i), str.indexOf(str.charAt(i)) + 1) == -1) {
            return str[i];
        }
    }
}

// Time O(n)
// Space O(n)
const firstOccurrenceOfCharacter1 = (str) => {
    const obj = {};
    str.split('').forEach(character => {
        if (character in obj) {
            obj[character] = obj[character] + 1;
        } else {
            obj[character] = 1;
        }
    });
    for (item in obj) {
        if (obj[item] === 1) {
            return item;
        }
    }
}

// Time O(n)
// Space O(256)
const firstOccurrenceOfCharacter2 = (str) => {
    // max ASCII code 
    const NO_OF_CHAR = 256;

    // create a hash of length 256 and assign [0,0] intially at every index
    const hash = [];
    for (let i = 0; i < NO_OF_CHAR; i++) {
        hash[i] = [0, 0];
    }

    // loop over the string and update the ASCII values in hash
    for (let i = 0; i < str.length; i++) {
        // increase the occurence of character
        hash[str.charCodeAt(i)][0]++;
        // update the index of charecter
        hash[str.charCodeAt(i)][1] = i;
    }

    // let resulting char have maximum index
    let res = Number.MAX_VALUE;
    // loop over the hash
    for (let i = 0; i < NO_OF_CHAR; i++) {
        // if the charater only occur once 
        if (hash[i][0] === 1) {
            res = Math.min(res, hash[i][1]);
        }
    }

    return res === Number.MAX_VALUE ? -1 : str[res];
}

const out1 = firstOccurrenceOfCharacter2(input1);

console.log("input : ", input1);
console.log("first non-repeated character : ", out1);