// Prime number within a given range

const start = 20;
const end = 50000;

// check for prime number
// Time O(sqrt(n))
// Space O(1)
const isPrimeNumber = (number) => {
    if (number < 2) {
        return false;
    }
    if (number < 4) {
        return true;
    }
    if (number % 2 === 0 || number % 3 === 0) {
        return false;
    }

    for (let i = 5; i <= Math.sqrt(number); i = i + 6) {
        if (number % i === 0 || number % (i + 2) === 0) {
            return false;
        }
    }
    return true;
}

const printAllPrime = (start, end) => {
    for (let i = start; i <= end; i++) {
        if (isPrimeNumber(i)) {
            console.log(i);
        }
    }
}

printAllPrime(start, end);