// calculate the sum of N natural number

// 5 => 5 + 4 + 3 + 2 + 1

// using recursion
const sumRecursion = (num) => {
  // base case
  if (num <= 1) {
    return num;
  }
  return num + sumRecursion(num - 1);
};
// sumRecursion(5);
// 5 + sumRecursion(4);
// 5 + (4 + sumRecursion(3));
// 5 + (4 + (3 + sumRecursion(2)));
// 5 + (4 + (3 + (2 + sumRecursion(1))));
// 5 + (4 + (3 + (2 + (1 + sumRecursion(0)))));
// 5 + (4 + (3 + (2 + (1 + 0))));
// 5 + (4 + (3 + (2 + 1)));
// 5 + (4 + (3 + 3));
// 5 + (4 + 6);
// 5 + 10;
// 15;

// using tail recursion
const sumTailRecursion = (num, total = 0) => {
  // base case
  if (num === 0) {
    return total;
  } else {
    return sumTailRecursion(num - 1, total + num);
  }
};
// sumTailRecursion(5, 0);
// sumTailRecursion(4, 5);
// sumTailRecursion(3, 9);
// sumTailRecursion(2, 12);
// sumTailRecursion(1, 14);
// sumTailRecursion(0, 15);
// 15;

console.log("====================================");
console.log(sumRecursion(5));
console.log(sumTailRecursion(5));
console.log("====================================");
