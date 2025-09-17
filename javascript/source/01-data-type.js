// in js we have 
// primitive data types
// 1. number
// 2. string
// 3. boolean
// 4. null
// 5. undefined
// 6. symbol
// 7. bigint

// non-primitive data types
// 1. object
// 2. array
// 3. function

// number
let num1 = 10;
let num2 = 20.5;
console.log(typeof num1); // "number"
console.log(typeof num2); // "number"

// string
let str1 = "Hello, World!";
let str2 = 'JavaScript is fun.';
console.log(typeof str1); // "string"
console.log(typeof str2); // "string"

// boolean
let bool1 = true;
let bool2 = false;
console.log(typeof bool1); // "boolean"
console.log(typeof bool2); // "boolean"

// null
let nullVar = null;
console.log(typeof nullVar); // "object"

// undefined
let undefVar;
console.log(typeof undefVar); // "undefined"

// symbol
let sym1 = Symbol('sym1');
let sym2 = Symbol('sym2');
console.log(typeof sym1); // "symbol"
console.log(sym1 === sym2); // false

// bigint
let bigInt1 = BigInt(9007199254741991);
let bigInt2 = 9007199254741991n;
console.log(typeof bigInt1); // "bigint"
console.log(bigInt1 === bigInt2); // true

// object
let obj = {
    name: "John",
    age: 30
};
console.log(typeof obj); // "object"

// array
let arr = [1, 2, 3, 4, 5];
console.log(typeof arr); // "object"
console.log(Array.isArray(arr)); // true

// function
function greet() {
    return "Hello!";
}
console.log(typeof greet); // "function"
