// Leap year or not
// 1800, 1900, 2100, 2200
const year = 2000;

const checkLeapYear = (year) => {
    let leapYear = year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);

    if (leapYear) {
        return true;
    }
    return false;

    // return leapYear ? true : false;
    // return leapYear && true;
    // return year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0);
}

console.log(year, checkLeapYear(year) ? "is a leap year" : "is not a leap year");