// how to remove the duplicate character from String ?

const input = "RamRamJaiShreeRam";

// Time O(nlogn)
// Space O(1)
const removeDuplicate = (str) => str.split('').filter((item, pos, self) => self.indexOf(item) === pos).join('');

// Time O(n)
// Space O(n)
const removeDuplicateUsingSet = (str) => {
    const len = str.length;
    const set = new Set();

    for (let i = 0; i < len; i++) {
        set.add(str[i]);
    }
    return [...set].join("");
}

const out = removeDuplicate(input);
const out1 = removeDuplicateUsingSet(input);
console.log(out);
console.log(out1);