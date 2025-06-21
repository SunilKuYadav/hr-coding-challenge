// Anagram Substring Search
// 	Given a text txt[0..n - 1] and a pattern pat[0..m - 1], write a function search(char pat[], char txt[]) that prints all occurrences of pat[] and its permutations(or anagrams) in txt[].

//     Input: txt[] = "BACDGABCDA"  pat[] = "ABCD"
// Output:   Found at Index 0
//           Found at Index 5
//           Found at Index 6

const input = "BACDGABCDA";
const pat = "ABCD";

// Time -
// Space - 
const findPattern = (txt, pattern) => {
    const texLen = txt.length;
    const patternLen = pattern.length;

    const tempTxtArray = txt.split("");
    const tempPattern = pattern.split("").sort().join("");

    for (let i = 0; i < texLen - patternLen + 1; i++) {
        const subString = tempTxtArray.slice(i, i + patternLen).sort().join("");
        if (tempPattern === subString) {
            console.log("Found at Index ", i);
        }
    }
}

findPattern(input, pat);