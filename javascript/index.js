// Every thing in JavaScript happens inside an Execution Context
// There are two types of Execution Context
// 1. Global Execution Context
// 2. Functional Execution Context

// Execution Context has two phases
// 1. Creation Phase
// 2. Execution Phase

// In Creation Phase
// 1. Global Object (In browsers it's window object)
// 2. 'this' keyword
// 3. Memory allocation for variables and functions

// In Execution Phase
// The code is executed line by line and the variables are assigned their values

// JavaScript is a synchronous and single-threaded language
// It means that only one command is executed at a time and the next command is executed only after the previous command is completed

// Example to illustrate Execution Context

var a = 10;
function square(n) {
  return n * n;
}
var result = square(a);
console.log(result); // Output: 100

// Call Stack
// Call Stack is a stack data structure that keeps track of the function calls in a program
// When a function is called, a new execution context is created and pushed onto the call stack
// When the function execution is completed, the execution context is popped from the call stack

// Call stack maintains the order of function calls and ensures that the functions are executed in the correct order
// Call stack maintains the order of execution of execution contexts

// Hoisting
// Memory allocation for variables and functions before the code is executed is called hoisting
// In JavaScript, function declarations and variable declarations (using var) are hoisted to the top of their scope
// However, variable declarations using let and const are not hoisted

// undefined - state where variable is declared but not assigned any value
// ReferenceError - state where variable is not declared at all

getName(); // Output: John Doe
getName2(); // Output: TypeError: getName2 is not a function
console.log(age); // Output: undefined

// ReferenceError: age is not defined
var age = 21;

// this will behave as a function declaration and will be hoisted
// so getName will be available at the time of calling
function getName() {
  console.log("John Doe");
}

// this will behave as a variable declaration and will be hoisted
// but the assignment will not be hoisted
// so getName2 will be undefined at the time of calling
var getName2 = () => {
  console.log("John Doe");
};

// Function and Variable Environment

var num = 10;
a(); // Output: 20 : because of function scope will be searched in function a first then in global scope
b(); // Output: 30 : because of function scope will be searched in function b first then in global scope
console.log(num); // Output: 10 : it will be searched in global scope

function a() {
  var num = 20;
  console.log(num);
}
function b() {
  var num = 30;
  console.log(num);
}

// This Keyword
// The value of 'this' keyword is determined by how a function is called
// In the global context, 'this' refers to the global object (window in browsers)
// Inside a regular function, 'this' refers to the global object (in non-strict mode) or undefined (in strict mode)
// Inside a method (a function that is a property of an object), 'this' refers to the object that the method is called on
// Inside an arrow function, 'this' retains the value of the enclosing lexical context's 'this'

// Example 1: Global Context
console.log(this); // In browsers, this will log the window object

// Example 2: Regular Function
function showThis() {
  console.log(this); // In non-strict mode, this will log the window object; in strict mode, it will be undefined
}
showThis();

// Example 3: Method in an Object
const obj = {
  name: "Alice",
  greet: function () {
    console.log(this.name); // 'this' refers to obj, so this.name is "Alice"
  },
};
obj.greet();

// Example 4: Arrow Function
const arrowFunc = () => {
  console.log(this); // 'this' retains the value from the enclosing context, which is the global object in this case
};
arrowFunc();

// --------------------------------------------------------------------------------------------

// undefined vs not defined
// undefined (placeholder in memory)- state where variable is declared but not assigned any value
// ReferenceError - state where variable is not declared at all

console.log(name); // Output: undefined
var name = "Alice";
console.log(age); // Output: ReferenceError: age is not defined

// JavaScript is loosely typed language
// We can change the type of variable at any time

let variable = 10; // variable is a number
variable = "Hello"; // now variable is a string
variable = true; // now variable is a boolean

// Dynamic Typing
// JavaScript is a dynamically typed language, which means that types are determined at runtime and can change as the program executes

let dynamicVar = 42; // Initially a number
console.log(typeof dynamicVar); // Output: "number"

dynamicVar = "Now I'm a string"; // Now it's a string
console.log(typeof dynamicVar); // Output: "string"

dynamicVar = { key: "value" }; // Now it's an object
console.log(typeof dynamicVar); // Output: "object"

// Type Coercion
// JavaScript performs type coercion, which means it automatically converts values from one type to another when necessary

let coercedSum = "5" + 10; // '5' is a string, 10 is a number
console.log(coercedSum); // Output: "510" (number 10 is coerced to string)

let coercedProduct = "5" * 10; // '5' is a string, 10 is a number
console.log(coercedProduct); // Output: 50 (string '5' is coerced to number)

// Truthy and Falsy Values
// In JavaScript, certain values are considered "truthy" or "falsy" when evaluated in a boolean context

if (0) {
  console.log("This won't execute because 0 is falsy");
}

if ("Hello") {
  console.log("This will execute because non-empty strings are truthy");
}

// --------------------------------------------------------------------------------------------

// Scope and Lexical Environment
// Scope is the current context of execution, which determines the accessibility of variables to JavaScript code
// Lexical Environment is a structure that holds identifier-variable mapping
// Every execution context has a lexical environment associated with it

// whenever a function is created, a lexical environment is created for that function
// Lexical environment of a function contains the function's arguments, inner variable declarations and functions
// JavaScript uses lexical scoping, which means that the scope of a variable is determined by its position in the source code
// Nested functions have access to variables declared in their outer scope

function a() {
  console.log(v); // Output: 10 : because of lexical scope will be searched in global scope

  var p = 20; // function scope

  k(); // calling function k inside function a
  function k() {
    console.log(p); // Output: 20 : because of lexical scope will be searched in function a first then in global scope
    console.log(v); // Output: 10 : because of lexical scope will be searched in global scope
  }
}
console.log(p); // Output: ReferenceError: p is not defined : because p is function scope variable and cannot be accessed outside the function
var v = 10; // global scope
a();

// ----------------------------------------------------------------------------------------------------

// Let and Const
// let and const declarations are block scoped
// and hoisted but it will be in temporal dead zone until the line of code where it is defined is executed

// time of creation phase to execution phase is called temporal dead zone

// ReferenceError: Cannot access 'x' before initialization (because of temporal dead zone)
// ReferenceError: x is not defined (if x was never declared)
// undefined (if x was declared with var but not initialized)
// SyntaxError: Identifier 'x' has already been declared
// SyntaxError: Missing initializer in const declaration
// TypeError: Assignment to constant variable.

console.log(x); // x is in temporal dead zone => Script Scope
console.log(y); // Output: undefined because of hoisting => Global Scope
let x = 10;
// let x = 15; // SyntaxError: Identifier 'x' has already been declared
// const a ; // SyntaxError: Missing initializer in const declaration
const a = 20;
// a = 25; // TypeError: Assignment to constant variable.
var y = 20;

// ---------------------------------------------------------------------------------------------
// Block Scope and Shadowing
// Variables declared with var are function scoped
// Variables declared with let and const are block scoped

// Block scope is the area within a pair of curly braces { ... }
// grouping statements together creates a new block scope

var functionVar = "I'm a function scoped variable";
{
  let blockVar = "I'm a block scoped variable";
  const blockConst = "I'm a block scoped constant";
  var functionVar = "I'm function scoped variable in Block";
  console.log(blockVar);
  console.log(blockConst);
  console.log(functionVar); // Output: I'm function scoped variable in Block
}
// console.log(blockVar); // ReferenceError: blockVar is not defined
// console.log(blockConst); // ReferenceError: blockConst is not defined
console.log(functionVar); // Output: I'm function scoped variable in Block : because var is function scoped and not block scoped and it got re-assigned in the block

// Shadowing occurs when a variable declared within a certain scope (inner scope) has the same name as a variable in an outer scope
// The inner variable "shadows" the outer variable within its scope

// Illegal Shadowing
let shadowVar = "I'm in global scope";
// var shadowVar = "I'm trying to shadow global scope"; // SyntaxError: Identifier 'shadowVar' has already been declared
// const shadowVar = "I'm trying to shadow global scope"; // SyntaxError: Identifier 'shadowVar' has already been declared

// --------------------------------------------------------------------------------------------------------------

// Closures
// A closure is the combination of function bundled together (enclosed) with references to its surrounding state (the lexical environment).
// In other words, a closure gives you access to an outer function's scope from an inner function
// In JavaScript, closures are created every time a function is created, at function creation time
// Closures are useful because they let you associate some data (the lexical environment) with a function that operates on that data
// This has obvious parallels to object-oriented programming, where objects allow us to associate some data (the object's properties) with one or more methods

// A closure is a function that retains access to its lexical scope, even when the function is executed outside that scope
// Closures are created whenever a function is created, at function creation time

function outerFunction(outerVariable) {
  return function innerFunction(innerVariable) {
    console.log("Outer Variable: " + outerVariable);
    console.log("Inner Variable: " + innerVariable);
  };
}

const newFunction = outerFunction("outside");
newFunction("inside");

// Example 2: Private Variables using Closures
function Counter() {
  let count = 0; // private variable

  return {
    increment: function () {
      count++;
      return count;
    },
  };
}

const counter = Counter();
console.log(counter.increment()); // Output: 1
console.log(counter.increment()); // Output: 2
// console.log(counter.count); // Output: undefined (count is not accessible from outside)

// Uses of Closures

// Module Design Pattern
// Currying
// Function like once
// Memoization
// Maintaining state in async world
// setTimeouts
// Iterators
// Partial applications

// Some practical uses of closures are:
// --------------------------------------------------------------------------------------------------------------
// 1. Data Privacy: Closures can be used to create private variables that cannot be accessed from outside the function
// 2. Function Factories: Closures can be used to create functions that generate other functions with specific behaviors
// 3. Maintaining State: Closures can be used to maintain state in an asynchronous environment, such as in event handlers or callbacks
// 4. Partial Application and Currying: Closures can be used to create functions with pre-set arguments, allowing for more flexible function calls
// 5. Memoization: Closures can be used to store the results of expensive function calls and return the cached result when the same inputs occur again
// 6. Module Pattern: Closures can be used to create modules that encapsulate functionality and expose only a public API
// 7. Event Handlers: Closures are often used in event handlers to maintain access to the context in which the handler was created
// 8. Asynchronous Programming: Closures are commonly used in asynchronous programming to maintain access to variables from the outer scope when the asynchronous operation completes
// 9. Callbacks: Closures are frequently used in callback functions to retain access to the outer function's scope
// 10. Functional Programming: Closures are a fundamental concept in functional programming, enabling higher-order functions and function composition
// --------------------------------------------------------------------------------------------------------------

// SetTimeout and Closures

function x() {
  for (var i = 1; i <= 5; i++) {
    setTimeout(() => {
      console.log(i); // Output: 6, 6, 6, 6, 6 because of var is function scoped and by the time the callback function is executed the loop is already completed and i is 6
    }, i * 1000);
  }

  for (let j = 1; j <= 5; j++) {
    setTimeout(() => {
      console.log(j); // Output: 1, 2, 3, 4, 5 because of let is block scoped and each iteration of the loop creates a new block scope
    }, j * 1000);
  }

  for (var k = 1; k <= 5; k++) {
    ((k) => {
      setTimeout(() => {
        console.log(k); // Output: 1, 2, 3, 4, 5 because of IIFE creates a new scope for each iteration and k is passed as an argument to the IIFE
      }, k * 1000);
    })(k);
  }
}
x();

// --------------------------------------------------------------------------------------------------------------

// First Class Functions
// Functions in JavaScript are first-class citizens, which means they can be treated like any other variable
// They can be assigned to variables, passed as arguments to other functions, and returned from other functions

// Function Statements aka Function Declarations
greet(); // Output: Hello, World!
function greet() {
  console.log("Hello, World!");
}

// Function Expressions
// greetExpression(); // Output: TypeError: greetExpression is not a function
const greetExpression = function () {
  console.log("Hello, World from Expression!");
};

// Anonymous Functions: used in function expressions or as arguments (value) to other functions
// These functions do not have a name and are often used as arguments to other functions or as immediately invoked function expressions (IIFE)
setTimeout(function () {
  console.log("Hello from Anonymous Function!");
}, 1000);

// Named Function Expressions
const factorial = function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1); // Named function expression allows recursion
};
console.log(factorial(5)); // Output: 120

// Parameters vs Arguments
// Parameters are the names listed in the function definition
// Arguments are the real values passed to (and received by) the function

function add(a, b) {
  // a and b are parameters
  return a + b;
}
console.log(add(2, 3)); // 2 and 3 are arguments

// First-Class Functions
// Functions can be treated like any other variable
// Assigning a function to a variable
const sayHello = function (name) {
  return `Hello, ${name}!`;
};
console.log(sayHello("Alice")); // Output: Hello, Alice!

// Passing a function as an argument
function greetUser(greetingFunction, userName) {
  console.log(greetingFunction(userName));
}
greetUser(sayHello, "Bob"); // Output: Hello, Bob!

// Returning a function from another function
function createMultiplier(factor) {
  return function (number) {
    return number * factor;
  };
}
const double = createMultiplier(2);
console.log(double(5)); // Output: 10
const triple = createMultiplier(3);
console.log(triple(5)); // Output: 15

// Storing functions in data structures
const operations = [
  function (x) {
    return x + 1;
  },
  function (x) {
    return x * 2;
  },
  function (x) {
    return x * x;
  },
];
operations.forEach((op) => {
  console.log(op(5)); // Output: 6, 10, 25
});

// Arrow Functions
// Arrow functions provide a more concise syntax for writing function expressions
// They also lexically bind the 'this' value, which means they do not have their own 'this' context

const addNumbers = (a, b) => a + b;
console.log(addNumbers(3, 4)); // Output: 7

const square = (n) => n * n;
console.log(square(5)); // Output: 25

const logMessage = () => console.log("Hello from Arrow Function!");
logMessage(); // Output: Hello from Arrow Function!

// Arrow functions do not have their own 'this' context
const objWithArrow = {
  value: 42,
  getValue: () => {
    console.log(this.value); // 'this' does not refer to objWithArrow, it refers to the enclosing lexical context (global or undefined in strict mode)
  },
};
objWithArrow.getValue(); // Output: undefined

const objWithRegularFunc = {
  value: 42,
  getValue: function () {
    console.log(this.value); // 'this' refers to objWithRegularFunc
  },
};
objWithRegularFunc.getValue(); // Output: 42

// --------------------------------------------------------------------------------------------------------------

// Callback Functions
// A callback function is a function that is passed as an argument to another function and is executed after some operation has been completed
// Callbacks are commonly used in asynchronous programming to handle operations that take time to complete, such as network requests or file I/O

function fetchData(callback) {
  setTimeout(() => {
    const data = { name: "John", age: 30 };
    callback(data); // Execute the callback function with the fetched data
  }, 2000);
}

function processData(data) {
  console.log("Processing Data:", data);
}

fetchData(processData); // After 2 seconds, Output: Processing Data: { name: 'John', age: 30 }

// Example of Callback Hell
setTimeout(() => {
  console.log("Step 1");
  setTimeout(() => {
    console.log("Step 2");
    setTimeout(() => {
      console.log("Step 3");
      setTimeout(() => {
        console.log("Step 4");
      }, 1000);
    }, 1000);
  }, 1000);
}, 1000);

// To avoid callback hell, we can use Promises or async/await (introduced in ES6 and ES8 respectively)

function attachEventListener() {
  let counter = 0;
  document.getElementById("myButton").addEventListener("click", function xyz() {
    console.log("Button Clicked!", counter++);
  });
}
attachEventListener();

// --------------------------------------------------------------------------------------------------------------

// Promises
// A Promise is an object that represents the eventual completion (or failure) of an asynchronous operation and its resulting value
// A Promise is in one of three states:
// 1. Pending: Initial state, neither fulfilled nor rejected
// 2. Fulfilled: The operation completed successfully, resulting in a resulting value
// 3. Rejected: The operation failed, resulting in a reason for the failure

// Creating a Promise
const myPromise = new Promise((resolve, reject) => {
  const success = true; // Simulating success or failure
  setTimeout(() => {
    if (success) {
      resolve("Promise Resolved!"); // Fulfill the promise
    } else {
      reject("Promise Rejected!"); // Reject the promise
    }
  }, 2000);
});

// Consuming a Promise
myPromise
  .then((message) => {
    console.log(message); // Output: Promise Resolved!
  })
  .catch((error) => {
    console.error(error); // Output: Promise Rejected!
  })
  .finally(() => {
    console.log("Promise has been settled (either resolved or rejected).");
  });

// Chaining Promises
const fetchUserData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ userId: 1, userName: "JohnDoe" });
    }, 1000);
  });
};

const fetchUserPosts = (userId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { postId: 1, content: "Hello World" },
        { postId: 2, content: "Learning Promises" },
      ]);
    }, 1000);
  });
};

fetchUserData()
  .then((user) => {
    console.log("User Data:", user);
    return fetchUserPosts(user.userId);
  })
  .then((posts) => {
    console.log("User Posts:", posts);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

// --------------------------------------------------------------------------------------------------------------

// Async/Await
// Async/Await is a syntactic sugar built on top of Promises that allows you to write asynchronous code in a more synchronous-looking manner
// The 'async' keyword is used to declare an asynchronous function, which returns a Promise
// The 'await' keyword is used to wait for a Promise to resolve or reject

// Example of Async/Await
const fetchDataAsync = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Data fetched successfully!");
    }, 2000);
  });
};

const asyncFunction = async () => {
  try {
    console.log("Fetching data...");
    const data = await fetchDataAsync(); // Wait for the Promise to resolve
    console.log(data); // Output: Data fetched successfully!
  } catch (error) {
    console.error("Error:", error); // Handle any errors
  } finally {
    console.log("Async function has completed.");
  }
};

asyncFunction();

// --------------------------------------------------------------------------------------------------------------

// Event Loop and Event Queue
// JavaScript is single-threaded, meaning it can execute one piece of code at a time
// The Event Loop is a mechanism that allows JavaScript to perform non-blocking operations by offloading tasks to the browser or Node.js environment
// The Event Loop continuously checks the Call Stack and the Event Queue
// If the Call Stack is empty, it takes the first task from the Event Queue and pushes it onto the Call Stack for execution
// This allows JavaScript to handle asynchronous operations, such as I/O tasks, timers, and user interactions, without blocking the main thread

console.log("Start");

setTimeout(() => {
  console.log("Timeout 1");
}, 0);

Promise.resolve().then(() => {
  console.log("Promise 1");
});

console.log("End");

// Output:
// Start
// End
// Promise 1
// Timeout 1

// Explanation:
// 1. "Start" is logged first because it's a synchronous operation.
// 2. The setTimeout callback is scheduled to run after 0 milliseconds, but it goes to the Event Queue.
// 3. The Promise is resolved immediately, and its .then() callback is also scheduled to run, but it goes to the Microtask Queue (which has higher priority than the Event Queue).
// 4. "End" is logged next because it's also a synchronous operation.
// 5. The Event Loop checks the Call Stack, finds it empty, and first processes the Microtask Queue, logging "Promise 1".
// 6. Finally, it processes the Event Queue, logging "Timeout 1".

// Event loop have following components
// 1. Call Stack
// 2. Web APIs (provided by browser or Node.js environment)
// 3. Event Queue (or Callback Queue)
// 4. Microtask Queue (for Promises and Mutation Observers)
// 5. Event Loop

// JavaScript engine picks up the task for execution from the call stack. Event loop continuously checks the call stack for any function that needs to be run.

// Macro task is any JavaScript code which is scheduled to run by the standard mechanism such as an event callback, interval or timeout.
// setTimeout, setInterval, I/O, UI rendering are examples of macro tasks.

// Micro task is any JavaScript code which is scheduled to run after the currently executing script and before any other event or rendering.
// All the micro tasks will be executed in one go-around of the event loop. One micro task can schedule another micro task.
// Promise callbacks, MutationObserver are examples of micro tasks.
// Promise, queueMicrotask, MutationObserver are examples of micro tasks.

// The event loop first clears the microtask queue and then processes the next task from the macrotask queue.

const runExampleOfEventLoop = () => {
  console.log("Script start");

  setTimeout(() => {
    console.log("setTimeout");
  }, 0);

  setImmediate(() => {
    console.log("setImmediate");
  });

  Promise.resolve()
    .then(() => console.log("1"))
    .then(() => console.log("2"));

  Promise.resolve()
    .then(() => console.log("3"))
    .then(() => console.log("4"));

  fetch("https://jsonplaceholder.typicode.com/todos/1")
    .then((response) => response.json())
    .then((json) => console.log(json));

  console.log("Script end");
};

runExampleOfEventLoop();

// Output:
// Script start
// Script end
// 1
// 3
// 2
// 4
// { userId: 1, id: 1, title: 'delectus aut autem', completed: false }
// setTimeout
// setImmediate

// Explanation:
// 1. "Script start" and "Script end" are logged first because they are synchronous operations.
// 2. The setTimeout callback is scheduled to run after 0 milliseconds, but it goes to the Event Queue.
// 3. The setImmediate callback is also scheduled to run, but it goes to the Event Queue as well.
// 4. The Promises are resolved immediately, and their .then() callbacks are scheduled to run in the Microtask Queue.
// 5. The fetch request is initiated, and its .then() callbacks are also scheduled to run in the Microtask Queue once the response is received.
// 6. The Event Loop checks the Call Stack, finds it empty, and first processes the Microtask Queue, logging "1", "3", "2", and "4" in that order.
// 7. Once the Microtask Queue is empty, the Event Loop processes the Event Queue, logging the result of the fetch request and then "setTimeout" and "setImmediate".

// Note: The order of "setTimeout" and "setImmediate" may vary depending on the environment (Node.js or browser) and timing.

// --------------------------------------------------------------------------------------------------------------

// SetTimeout has trust issue
// if the call stack is busy, the callback function will be delayed
console.log("Start");

setTimeout(() => {
  console.log("Timeout 1");
}, 1000);

setTimeout(() => {
  console.log("Timeout 2");
}, 0);

console.log("End");

const start = Date.now();

// this while loop will block the call stack for 10 seconds
// setTimeout callbacks will be delayed until the call stack is free
while (Date.now() - start < 10000) {
  // Simulating a blocking operation for 2 seconds
}

// Output:
// Start
// End
// Timeout 2
// Timeout 1

// Explanation:
// 1. "Start" is logged first because it's a synchronous operation.
// 2. The first setTimeout is scheduled to run after 1000 milliseconds, but it goes to the Event Queue.
// 3. The second setTimeout is scheduled to run after 0 milliseconds, but it also goes to the Event Queue.
// 4. "End" is logged next because it's also a synchronous operation.
// 5. The Event Loop checks the Call Stack, finds it empty, and processes the Event Queue.
// 6. "Timeout 2" is logged first because it was scheduled with a delay of 0 milliseconds, which means it will be executed as soon as possible after the current script completes.
// 7. Finally, "Timeout 1" is logged after approximately 1000 milliseconds.

// Note: The actual timing of the setTimeout callbacks may vary depending on the environment (Node.js or browser) and system load. The delay specified in setTimeout is the minimum time to wait before executing the callback, but it does not guarantee that the callback will be executed exactly after that time. Other tasks in the Event Queue may delay its execution.

// --------------------------------------------------------------------------------------------------------------\

// Higher Order Functions
// A higher-order function is a function that either takes one or more functions as arguments or returns a function as its result
// Higher-order functions are a key feature of functional programming and allow for more abstract and flexible code

// Example 1: Function that takes another function as an argument
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map((num) => num * 2); // map is a higher-order function
console.log(doubled); // Output: [2, 4, 6, 8, 10]

// Example 2: Function that returns another function
const createMultiplier = (factor) => {
  return (number) => number * factor; // returning a function
};

const _double = createMultiplier(2);
console.log(_double(5)); // Output: 10

const _triple = createMultiplier(3);
console.log(_triple(5)); // Output: 15

// Example 3: Function that takes multiple functions as arguments
const applyOperation = (a, b, operation) => {
  return operation(a, b);
};

const sum = (x, y) => x + y;
const product = (x, y) => x * y;

console.log(applyOperation(5, 3, sum)); // Output: 8
console.log(applyOperation(5, 3, product)); // Output: 15

// Example 4: Using higher-order functions for function composition
const compose = (f, g) => {
  return (x) => f(g(x));
};

const add1 = (x) => x + 1;
const multiply2 = (x) => x * 2;

const add1ThenMultiply2 = compose(multiply2, add1);
console.log(add1ThenMultiply2(5)); // Output: 12

// Example 5: Custom implementation of a higher-order function
const radius = [3, 1, 4, 2];
const area = (r) => Math.PI * r * r;
const circumference = (r) => 2 * Math.PI * r;
const diameter = (r) => 2 * r;

// calculate is a higher-order function that takes an array and a logic function as arguments
const calculate = (arr, logic) => {
  const output = [];
  for (let i = 0; i < arr.length; i++) {
    output.push(logic(arr[i]));
  }
  return output;
};

// make just like map function
Array.prototype.calculate = function (logic) {
  const output = [];
  for (let i = 0; i < this.length; i++) {
    output.push(logic(this[i]));
  }
  return output;
};

console.log(radius.map(area));
console.log(calculate(radius, area));
console.log(radius.calculate(area));

console.log(radius.map(circumference));
console.log(calculate(radius, circumference));
console.log(radius.calculate(circumference));

console.log(radius.map(diameter));
console.log(calculate(radius, diameter));
console.log(radius.calculate(diameter));

// --------------------------------------------------------------------------------------------------------------

// Map, Filter and Reduce
// These are built-in higher-order functions in JavaScript that operate on arrays

const nums = [1, 2, 3, 4, 5];

// Map: creates a new array by applying a function to each element of the original array
const squares = nums.map((num) => num * num);
console.log(squares); // Output: [1, 4, 9, 16, 25]

// Filter: creates a new array with all elements that pass the test implemented by the provided function
const evens = nums.filter((num) => num % 2 === 0);
console.log(evens); // Output: [2, 4]

// Reduce: applies a function against an accumulator and each element in the array (from left to right) to reduce it to a single value
const _sum = nums.reduce((accumulator, current) => accumulator + current, 0);
console.log(_sum); // Output: 15

// Example of chaining map, filter, and reduce
const chainedResult = nums
  .map((num) => num * 2) // [2, 4, 6, 8, 10]
  .filter((num) => num > 5) // [6, 8, 10]
  .reduce((accumulator, current) => accumulator + current, 0); // 24
console.log(chainedResult); // Output: 24

const users = [
  { firstName: "John", lastName: "Doe", age: 25 },
  { firstName: "Jane", lastName: "Smith", age: 30 },
  { firstName: "Alice", lastName: "Johnson", age: 22 },
  { firstName: "Bob", lastName: "Brown", age: 22 },
];
// find all user firstName whose age is less the 25 in array of name
users.filter((user) => user.age < 25).map((user) => user.firstName);

users.reduce((acc, curr) => {
  if (curr.age < 25) {
    acc.push(curr.firstName);
  }
}, []);

// --------------------------------------------------------------------------------------------------------------

// Callback

const cart = ["pizza", "roll", "sandwich"];

api.creteOrder(cart, () => {
  api.proceedToPayment(() => {
    api.showOrderSummary(() => {
      console.log("Done");
    });
  });
});
// This is known as callback hell
// Where callback is dependent on other callback response
// also known as pyramid of doom

// Inversion of control
// we are giving control to createOrder followed by proceedToPayment and showOrderSummary
// what happen if createOrder never executed or executed twice

// Promises
// Promise is an Object that represent eventual compilation of async operations

createOrder(cart, (orderId) => {
  proceedToPayment(orderId, (paymentInfo) => {
    showOrderSummary(paymentInfo, () => {
      updateWalletBalance();
    });
  });
});

// Using Promise chaining
creteOrder(cart)
  .then((orderId) => proceedToPayment(orderId))
  .then((paymentInfo) => showOrderSummary(paymentInfo))
  .then((summaryInfo) => updateWalletBalance(summaryInfo))
  .catch((err) => console.log(err));

// actual implementation

const promise = createOrder(cart);
promise
  .then((orderId) => {
    console.log(orderId);
    return orderId;
  })
  .then((orderId) => {
    return proceedToPayment(orderId);
  })
  .then((paymentInfo) => {
    console.log(paymentInfo);
  })
  .catch((err) => {
    console.log(err.message);
  })
  .then(() => {
    console.log("this will run, no matter what happen with above call");
  });

const createOrder = (cart) => {
  const pr = new Promise((resolve, reject) => {
    // create a order
    // validate cart
    // return order id

    if (isValidCart(cart)) {
      setTimeout(() => resolve("1234"), 2000);
    } else {
      const err = new Error("Cart is not valid");
      reject(err);
    }
  });

  return pr;
};

const proceedToPayment = (orderId) =>
  new Promise((res) => res("Payment is Successful for: ", orderId));
const isValidCart = (cart) => (cart.length > 0 ? true : false);

// async and await
const resolvedPromise = () =>
  new Promise((resolve) => resolve("Resolved Promise"));

// always return a promise
const getData = async () => {
  // return "Hello";
  return resolvedPromise;
};
const dataPromise = getData();
dataPromise.then((res) => console.log(res));

const handlePromise = async (promise) => {
  const val = await promise;
  console.log(val);
};
handlePromise(resolvedPromise);

const promise1 = () =>
  new Promise((resolve) => setTimeout(() => resolve("Promise1"), 10000));
const promise2 = () =>
  new Promise((resolve) => setTimeout(() => resolve("Promise2"), 5000));

const handlePromises = async () => {
  console.log("Start");

  const val = await promise1;
  console.log(val);

  const val2 = await promise2;
  console.log(val2);

  console.log("End");
};

handlePromises().catch(err => console.log(err))
