// Armstrong number in a given range

const start = 1;
const end = 12345;

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

const printAllArmstrongNumbers = (start, end) => {
    for (let i = start; i <= end; i++) {
        if (checkArmstrong(i)) {
            console.log(i);
        }
    }
}

printAllArmstrongNumbers(start, end);