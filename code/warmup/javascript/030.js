// How do you reverse a given string in place ?

const input = "RamIsTheKing";

const reverseStr = (str) => {
    return str.split("").reduce((result, char) => char + result, "")
}

const reverseStr1 = (str) => {
    return str.split("").reverse().join("");
}

const reverseStr2 = (str) => {
    // slice(start, end)
    return str === "" ? "" : reverseStr(str.slice(1)) + str[0]
}

const out = reverseStr(input);

console.log(`Input : ${input}\nOutput : ${out}`)