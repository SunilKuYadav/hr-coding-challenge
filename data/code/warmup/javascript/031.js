// How do you print duplicate characters from a string ?

const input = "RamIsTheBestOneElseSeeKrishanaGodBlessYou";

// Time O(n)
// Space O(256)
(printCountStr = str => {
    const NO_OF_CHAR = 256;
    const countChar = new Array(NO_OF_CHAR);

    // fill(value, start, end)
    countChar.fill(0);

    // llop over str and update its occurence
    for (let i = 0; i < str.length; i++) {
        countChar[str.charCodeAt(i)]++
    }

    // print all duplicate chars
    for (let i = 0; i < NO_OF_CHAR; i++) {
        if (countChar[i] > 1) {
            console.log(`${String.fromCharCode(i)}, count : ${countChar[i]}\n`)
        }
    }
})(input)

