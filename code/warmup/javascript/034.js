// How can a given string be reversed using recursion ?

const input = "RamRamRamRamRamRamRam";

const reverse = str => {
    return str === "" ? str : reverse(str.slice(1)) + str[0];
}

const out = reverse(input);

console.log(out);