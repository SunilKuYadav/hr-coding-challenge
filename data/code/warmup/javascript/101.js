// Positive or Negative number

const input = [-1, -2, 1234567891234567, 2];

const checkNumber = (num) => {
    return num > 0;
    // if (num > 0) {
    //     return true;
    // }
    // return false;

    // return num > 0 ? true : false;

    // return num > 0 && true;

    // return num >> 31 !== -1 && true;

    // return Math.sign(num) !== -1 && true;

}
// https://bitwisecmd.com/

input.forEach(item => {
    console.log(item, " is ", checkNumber(item) ? "positive" : "negative");
})