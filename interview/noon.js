async function bar() {
  console.log("L");
}
function baz() {
  console.log("M");
}
bar();
baz();
// L => M
// Explaination:
//  You call bar().
// 	bar is an async function, but being async doesn’t make the whole function delayed.
//  This is a normal synchronous statement, so "L" is printed immediately.

const p = new Promise((resolve) => {
  console.log("H");
  resolve();
}).then(() => {
  console.log("I");
});
async function foo() {
  console.log("J");
  return "done";
}
foo().then(() => {
  console.log("K");
});
// H => J => I => K
// 1.	"H" → from inside the new Promise executor (synchronous).
// 2.	"J" → from inside foo() (synchronous until await, but here no await before return).
// 3.	"I" → from .then() attached to the first promise (microtask).
// 4.	"K" → from .then() attached to the promise returned by foo() (microtask).

console.log("A");
setTimeout(() => {
  console.log("B");
}, 0);
Promise.resolve().then(() => {
  console.log("C");
});
console.log("D");
setTimeout(() => {
  console.log("E");
}, 0);
Promise.resolve().then(() => {
  console.log("F");
});
console.log("G");
// A => D => G => C => F => B => E
// Synchronous logs (A, D, G) → run immediately, in order.
// Microtasks (C, F) → run after the entire sync code, but before timers.
// Macrotasks (B, E) → run afterward, in order they were scheduled.

setTimeout(() => {
  console.log("B");
}, 0);
Promise.resolve()
  .then(() => {
    console.log("C");
  })
  .then(() => {
    console.log("H");
  });
setTimeout(() => {
  console.log("E");
}, 0);
Promise.resolve()
  .then(() => {
    console.log("F");
  })
  .then(() => {
    console.log("I");
  });
// C => F => H => I => B => E

// Step 1 – Scheduling
// 	•	setTimeout(..., 0) → schedules B in the macrotask queue
// 	•	Promise.resolve().then(...) → schedules C in the microtask queue;
// its chained .then(() => console.log("H")) will schedule H as another microtask, but only after C runs.
// 	•	Next setTimeout(..., 0) → schedules E in the macrotask queue (after B).
// •	Another Promise.resolve().then(...) → schedules F in the microtask queue;
// its chained .then(() => console.log("I")) will schedule I as another microtask, but only after F runs.

// Order of microtasks:
// 1.	C (first .then) → logs "C"
// → then schedules "H" for later microtask.
// 2.	F (first .then) → logs "F"
// → then schedules "I" for later microtask.
// 3.	H (chained .then) → logs "H"
// 4.	I (chained .then) → logs "I"

// Step 3 – Run macrotasks (timers)
//
// Now the event loop moves to the macrotask queue:
//     1.	First timeout → logs "B"
// 2.	Second timeout → logs "E"
