// stack LIFO

// pop => last element and delete it
// push => append at last
// top => return last element
// size => size of elements

class Stack {
  constructor() {
    this.items = [];
  }

  push(element) {
    this.items.push(element);
  }

  pop() {
    if (this.isEmpty()) return "Stack is empty";
    return this.items.pop();
  }

  top() {
    if (this.isEmpty()) return "Stack is empty";
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  print() {
    console.log(this.items.join(" "));
  }
}

// Balance Parenthesis
const isParenthesisBalanced = (string) => {
  const stack = new Stack();

  for (let i = 0; i < string.length; i++) {
    if (stack.isEmpty()) {
      stack.push(string[i]);
    }
    if (
      (stack.top() === "(" && string[i] === ")") ||
      (stack.top() === "{" && string[i] === "}") ||
      (stack.top() === "[" && string[i] === "]")
    ) {
      stack.pop();
    }
  }
  return stack.isEmpty() ? true : false;
};

// const string = "()[{}()]";
// console.log(isParenthesisBalanced(string));

// Min stack
// Next Greater Number (Monatomic Stack)

// Time O(2n) | Space O(n) + O (n)
const getNextGreaterNumber = (number) => {
  const results = [];
  const stack = new Stack();

  for (let i = number.length - 1; i >= 0; i--) {
    while (!stack.isEmpty() && stack.top() <= number[i]) {
      stack.pop();
    }
    if (stack.isEmpty()) {
      results[i] = -1;
    } else {
      results[i] = stack.top();
    }
    stack.push(number[i]);
  }

  return results;
};

// Time O(2n) | Space O(2n) + O (n)
const getNextGreaterNumberCircular = (number) => {
  const results = [];
  const stack = new Stack();

  for (let i = 2 * number.length - 1; i >= 0; i--) {
    while (!stack.isEmpty() && stack.top() <= number[i % number.length]) {
      stack.pop();
    }
    if (i < number.length) {
      results[i] = stack.isEmpty() ? -1 : stack.top();
    }
    stack.push(number[i % number.length]);
  }

  return results;
};
// const number = [4, 12, 5, 3, 1, 2, 5, 3, 1, 2, 4, 6];
// console.log(getNextGreaterNumber(number));
// console.log(getNextGreaterNumberCircular(number));

// nearest smallest elements in left
// Time O(2n) | Space O(n)
const nearestSmallestNumber = (number) => {
  const result = [];
  const stack = new Stack();

  for (let i = 0; i < number.length; i++) {
    while (!stack.isEmpty() && stack.top() >= number[i]) {
      stack.pop();
    }
    result[i] = stack.isEmpty() ? -1 : stack.top();

    stack.push(number[i]);
  }
  return result;
};
// const number = [5, 7, 9, 6, 7, 5, 1, 3, 7];
// console.log(nearestSmallestNumber(number))

// Trapping Rain water

// Time O(3n) | Space O (2n)
const trappingRainWater = (number) => {
  let total = 0;
  let prefixMax = [number[0]];
  let suffixMax = [];

  for (let i = 1; i < number.length; i++) {
    prefixMax.push(Math.max(prefixMax[i - 1], number[i]));
  }

  suffixMax[number.length - 1] = number[number.length - 1];
  for (let i = number.length - 2; i >= 0; i--) {
    suffixMax[i] = Math.max(suffixMax[i + 1], number[i]);
  }

  for (let i = 0; i < number.length; i++) {
    if (number[i] < prefixMax[i] && number[i] < suffixMax[i]) {
      total += Math.min(prefixMax[i], suffixMax[i]) - number[i];
    }
  }

  return total;
};

// Time O(n) | Space O(1)
const trappingRainWaterTowPointer = (number) => {
  let leftMax = 0;
  let rightMax = 0;
  let left = 0;
  let right = number.length - 1;
  let total = 0;

  while (left < right) {
    if (number[left] <= number[right]) {
      if (leftMax > number[left]) {
        total += leftMax - number[left];
      } else {
        leftMax = number[left];
      }
      left += 1;
    } else {
      if (rightMax > number[right]) {
        total += rightMax - number[right];
      } else {
        rightMax = number[right];
      }
      right -= 1;
    }
  }

  return total;
};

// const number = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1];
// console.log(trappingRainWater(number));
// console.log(trappingRainWaterTowPointer(number));

// Sum of subarray minimums
// get sum of all sub array of min values
const minimumOfSubarray = (number) => {
  let sum = 0;

}

const number = [3, 1, 2, 4];
// const number = [1, 4, 6, 7, 3, 7, 8, 1];
console.log(minimumOfSubarray(number));
// queue FIFO

// pop => last element and delete it
// push => append at first
// top => return last element
// size => size of elements

class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(element) {
    this.items.push(element);
  }

  dequeue() {
    if (this.isEmpty()) return "Queue is empty";
    return this.items.shift(); // O(n)
  }

  peek() {
    if (this.isEmpty()) return "Queue is empty";
    return this.items[0];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  size() {
    return this.items.length;
  }

  print() {
    console.log(this.items.join(" "));
  }
}
