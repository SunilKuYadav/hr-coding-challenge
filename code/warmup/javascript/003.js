// How do you count the occurrence of a given character in a string

const input1 = "ramramjaishreeram";
const input2 = "helloDearHowAreYouDoing";

// Time O(n)
// Space O(n)
const occurrenceOfCharacter = (str) => {
    const obj = {};
    str.split('').forEach(character => {
        if (character in obj) {
            obj[character] = obj[character] + 1;
        } else {
            obj[character] = 1;
        }
    });
    return obj;
}

// Time O(n)
// Space O(1)
const occurrenceOfGivenCharacter = (str, ch) => {
    let count = 0;
    str.split('').forEach(character => {
        if (character === ch) {
            count++;
        }
    });
    return count;
}
const occurrenceOfGivenCharacter1 = (str, ch) => {
    let count = 0;
    const len = str.length;
    for (let i = 0; i < len; i++) {
        if (str.charAt(i) === ch) {
            count++;
        }
    }
    return count;
}



const out1 = occurrenceOfCharacter(input1);
const out2 = occurrenceOfCharacter(input2);

const out3 = occurrenceOfGivenCharacter1(input1, "a");
const out4 = occurrenceOfGivenCharacter1(input2, "o");

console.log("input: ", input1);
console.log("output : ", out1);

console.log("input: ", input2);
console.log("output : ", out2);


console.log("input: ", input1, ' ch : ', "a");
console.log("a : ", out3);

console.log("input: ", input2, ' ch : ', "o");
console.log("o : ", out4);
