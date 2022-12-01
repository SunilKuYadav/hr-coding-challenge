// How do you find the duplicate number on a given integer array?

const input = [4, 2, 5, 2, 3, 1];

// Time O(n)
// Space O(n)
const findDuplicate = (arr) => {
  const set = new Set();
  const len = arr.length;
  for (let i = 0; i < len; i++) {
    if (set.size !== 0 && set.has(arr[i])) {
      return arr[i];
    }
    set.add(arr[i]);
  }
};

// Time O(n)
// Space O(1)
const findDuplicate1 = (arr) => {
  // start hopping from Node_#0
  let [slow, fast] = [0, 0];

  // for locating start node of cycle
  let check = 0;

  // Step_#1
  // Cycle detection
  // Let slow jumper and fast jumper meet somewhere in the cycle

  while (true) {
    // slow jumpper hops 1 step, while fast jumpper hops two steps forward
    slow = arr[slow];
    fast = arr[arr[fast]];

    if (slow == fast) {
      break;
    }
  }

  // Step_#2
  // Locate the start node of cycle (i.e., the duplicate number)
  while (true) {
    slow = arr[slow];
    check = arr[check];

    if (slow == check) {
      break;
    }
  }
  return check;
};

const out = findDuplicate(input);
const out1 = findDuplicate1(input);

console.log(`Input : ${input}\nDuplicate : ${out}`);
console.log(`Input : ${input}\nDuplicate : ${out1}`);
