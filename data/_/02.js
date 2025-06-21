// reverse string by 2 char

// input = "Hello World"
// output = "ldor WloelH"

const input = "Hello World";

// Time O(n/2)
// Space O(n)
const reverseStrByTwoChar = (str) => {
    const tempStrArray = str.split("");
    const len = tempStrArray.length;

    let res = "";
    for (let i = len; i > 0; i -= 2) {
        res += tempStrArray.slice(i - 2, i).join("");
    }

    // base condition
    if (len % 2 !== 0) {
        res += tempStrArray[0];
    }

    return res;
}


console.log(reverseStrByTwoChar(input));