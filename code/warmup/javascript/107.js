// Greatest of the Three numbers

const num1 = 5;
const num2 = 2;
const num3 = 9;

const findGreatestNumber = (...arg) => {
    return Math.max(...arg);

    // const [num1, num2, num3] = arg;
    // if (num1 > num2) {
    //     if (num1 > num3) {
    //         return num1;
    //     } else {
    //         return num3;
    //     }
    // } else {
    //     if (num2 > num3) {
    //         return num2;
    //     } else {
    //         return num3;
    //     }
    // }

    // return num1 > num2 ? (num1 > num3 ? num1 : num3) : (num2 > num3 ? num2 : num3);

    // if (num1 >= num2 && num1 >= num3) {
    //     return num1;
    // }
    // if (num2 >= num1 && num2 >= num3) {
    //     return num2;
    // }
    // if (num3 >= num1 && num3 >= num2) {
    //     return num3;
    // }
}

console.log(findGreatestNumber(num1, num2, num3))