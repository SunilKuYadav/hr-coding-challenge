// How do you swap two numbers without using the third variable

// Destructuring object
const swapTwoNum1 = (num1, num2) => {
  [num1, num2] = [num2, num1];
  return [num1, num2];
};

// Addition and difference
const swapTwoNum2 = (num1, num2) => {
  num1 = num1 + num2;
  num2 = num1 - num2;
  num1 = num1 - num2;
  return [num1, num2];
};

// Bitwise XOR operator
const swapTwoNum3 = (num1, num2) => {
  num1 = num1 ^ num2;
  num2 = num1 ^ num2;
  num1 = num1 ^ num2;
  return [num1, num2];
};

const swapTwoNum4 = (num1, num2) => {
  num2 = [num1, (num1 = num2)][0];
  return [num1, num2];
};
const swapTwoNum5 = (num1, num2) => {
  num2 = num1 + (num1 = num2) - num2;
  return [num1, num2];
};

const out = swapTwoNum1(10, 15);
const out1 = swapTwoNum2(10, 15);
const out2 = swapTwoNum3(10, 15);
const out3 = swapTwoNum4(10, 15);
const out4 = swapTwoNum5(10, 15);
console.log("====================================");
console.log("Input - 10, 15: output:- ", out[0], " ", out[1]);
console.log("Input - 10, 15: output:- ", out1[0], " ", out1[1]);
console.log("Input - 10, 15: output:- ", out2[0], " ", out2[1]);
console.log("Input - 10, 15: output:- ", out3[0], " ", out3[1]);
console.log("Input - 10, 15: output:- ", out4[0], " ", out4[1]);
console.log("====================================");
