// Armstrong number
// a narcissistic number in a given number base b is a number that is the sum of its own digits each raised to the power of the number of digits

const number = 9474;

const getDigit = (number) => {
    let i = 0;
    for (; number > 0; i++) {
        number = Math.floor(number / 10)
    }
    return i;
}

const checkArmstrong = (number) => {
    const digit = getDigit(number);

    let tempNumber = number;
    let result = 0;
    while (tempNumber > 0) {
        result += ((tempNumber % 10) ** digit);
        tempNumber = Math.floor(tempNumber / 10)
    }
    return result === number ? true : false;
}

console.log(checkArmstrong(number));