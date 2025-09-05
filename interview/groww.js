console.log("Start");

setTimeout(() => console.log("Timeout"), 0);

Promise.resolve().then(() => console.log("Promise"));

queueMicrotask(() => console.log('queueMicrotask'))

console.log("End");

// Start => End => queueMicrotask => Promise => Timeout


// console.log("Start");

// setTimeout(() => console.log("Timeout"), 0);

// Promise.resolve().then(() => console.log("Promise")); 

// console.log("End");

// Start => End => Timeout => Promise


// Promise.resolve()
//   .then(() => console.log("1"))
//   .then(() => console.log("2"));

// Promise.resolve()
//   .then(() => console.log("3"))
//   .then(() => console.log("4"));
  
  // 1 => 2 => 3 => 4


// console.log(num)

// const printNum = () => {
//   var num
//   console.log(num)
  
//   num = 8 
//   console.log(num)
// }

// printNum()

// console.log(num)


// console.log(10)
// Promise.resovle(40)
// Console.log(30)


// 10 => 30 => 40