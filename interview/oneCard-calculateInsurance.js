// Initial Implementation
// Time O(4) | Space O(1)
const calculateInsurance = (income) => {
  if (income <= 10000) {
    return income * 0.365;
  } else if (income <= 30000) {
    return (income - 10000) * 0.2 + 35600;
  } else if (income <= 60000) {
    return (income - 30000) * 0.1 + 76500;
  } else {
    return (income - 60000) * 0.02 + 105600;
  }
};

/* 
  Issues with the above version
  1.  Violates Open/Closed Principle (OCP) – adding new brackets requires modifying the function
  2.  Poor Separation of Concerns – bracket data and calculation logic are tightly coupled
  3.  Repetition – similar formulas repeated across conditions
  4.  Control-driven instead of Data-driven – relies on if/else rather than reusable data structures
*/

// Refactored: Data-Driven Approach
// space O(4)
const brackets = [
  { limit: 10000, rate: 0.365, base: 0, prev: 0 },
  { limit: 30000, rate: 0.2, base: 35600, prev: 10000 },
  { limit: 60000, rate: 0.1, base: 76500, prev: 30000 },
  { limit: Infinity, rate: 0.02, base: 105600, prev: 60000 },
];

// Final Implementation
// Time O(n) | space O(1)
const calculateInsuranceRefactored = (income, rules = brackets) => {
  const { prev, rate, base } = rules.find((b) => income <= b.limit);
  return (income - prev) * rate + base;
};

// Further Refactored:
// Space O(4)
const newBrackets = [
  { limit: 10000, rate: 0.365 },
  { limit: 30000, rate: 0.2 },
  { limit: 60000, rate: 0.1 },
  { limit: Infinity, rate: 0.02 },
];

// Time O(n) | Space O(n)
const prepareBrackets = (rules) => {
  let base = 0;
  let prev = 0;

  return rules.map((b) => {
    const result = { ...b, prev, base };
    if (b.limit < Infinity) {
      base += (b.limit - prev) * b.rate;
      prev = b.limit;
    }
    return result;
  });
};

const preparedBrackets = prepareBrackets(newBrackets);

// Time O(log n) | Space O(1)
const findBracket = (income, rules) => {
  let low = 0,
    high = rules.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (income <= rules[mid].limit) {
      if (mid === 0 || income > rules[mid - 1].limit) {
        return rules[mid];
      }
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return rules[rules.length - 1];
};

// Final Implementation
// Time O(log n) | Space O(n) for prepareBrackets one time
const calculateInsuranceNewRefactored = (income, rules = brackets) => {
  const { prev, rate, base } = findBracket(income, rules);
  return (income - prev) * rate + base;
};

// Usage Example
const testIncomes = [
  0, 100, 10000, 15000, 30000, 45000, 60000, 75000, 200000, 5000000,
];
console.log(...testIncomes.map(calculateInsurance));
console.log(...testIncomes.map((i) => calculateInsuranceRefactored(i)));
console.log(...testIncomes.map((i) => calculateInsuranceNewRefactored(i)));
