// Fibonacci Numbers


// Time O(n) | Space O(n) for recursion stack + O(n) for memoization

const fibonacci = (n, memo = {}) => {
  if (n in memo) return memo[n];
  if (n <= 2) return 1;
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}

// Time O(n) | Space O(1)

const fibonacciIterative = (n) => {
  if (n <= 1) return n;
  let a = 1, b = 1;

  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}



// Example usage:
console.log(fibonacci(6)); // Output: 8
console.log(fibonacci(50)); // Output: 12586269025