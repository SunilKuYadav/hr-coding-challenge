// Prime number
// a whole number greater than 1 that cannot be exactly divided by any whole number other than itself and 1(e.g. 2, 3, 5, 7, 11).

const number = 5;

const isPrimeNumber = (number) => {
    // base condition
    if (number < 2) {
        return false;
    }
    // for (let i = 2; i < number; i++) {
    //     if (number % i === 0) {
    //         return false
    //     }
    // }
    for (let i = 2; i < Math.floor(number / 2); i++) {
        if (number % i === 0) {
            return false
        }
    }
    return true
}

console.log(number, isPrimeNumber(number) ? "is a prime number" : "is not a prime number");