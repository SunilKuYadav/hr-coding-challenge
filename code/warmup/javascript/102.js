// Even or Odd number

const input = [-4, -3, - 2, -1, 0, 1, 2, 3, 4];

const checkNumber = (num) => {
    // if (num % 2 === 0) {
    //     return true;
    // }
    // return false;

    // return num % 2 === 0 ? true : false;

    // return num % 2 === 0;

    return num & 1 === 1 && true;

    // return num % 2 === 0 && true;

}

input.forEach(item => {
    console.log(item, " is ", checkNumber(item) ? "even" : "odd", " number");
})