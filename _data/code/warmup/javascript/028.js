// How to find the maximum occurring character in a given String ?

const input = "RamRamJaiShreeRam";

// Time O(n)
// Space O(256)

const getMaxOccuringChar = (str) => {
    const ASCII_SIZE = 256;
    const count = new Array(ASCII_SIZE);
    const len = str.length;

    // assign all char to be 0 count
    for (let i = 0; i < ASCII_SIZE; i++) {
        count[i] = 0
    }

    for (let i = 0; i < len; i++) {
        count[str[i].charCodeAt(0)] += 1
    }

    // intialize max and result
    let max = -1;
    let result = '';

    // loop over str
    for (let i = 0; i < len; i++) {
        if (max < count[str[i].charCodeAt(0)]) {
            max = count[str[i].charCodeAt(0)];
            result = str[i];
        }
    }

    return result
}

const out = getMaxOccuringChar(input);
console.log(out);