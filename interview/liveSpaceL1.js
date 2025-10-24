// const input = [1, 2, 3, 4, 5, 6, 7]
// const cb = (num, i) => {
//     return num * 2
// }

// const cbFilter = (num, i) => {
//     return num % 2 == 0
// }


// function myMap (arr, cb) {
//   let outputArr = []
  
//   for (let i = 0; i < arr.length; i++){
//     outputArr.push(cb(arr[i], i))
//   }
//   return outputArr
// }

// function myFilter (arr, cb) {
//   let outputArr = []
//   for (let i = 0; i < arr.length; i++){
//     if (cb(arr[i], i)) {
//       outputArr.push(arr[i])
//     }
//   }
//   return outputArr
// }

// // const output = myMap(input, cb)

// const output = myFilter(input, cbFilter)

// console.log(output)













// const input = [1, 2, 3, 4, 5, 6, 7]
// // const output = [2, 4, 6, 8, 10, 12, 14]


// // const output = input.map(num => num * 2)

// const evenArr = input.filter(num => num % 2 == 0)

// console.log(evenArr)




















// // console.log("Hello, World!");

// const input = [1, 2, 3, 4, 5, 6, 7]
// const numToRotate = 10 // 3
// // [2, 3, 4, 5, 6, 7, 1] => 0 => arr[0] <=> arr[len]
// // [3, 4, 5, 6, 7, 1, 2] =>
// // [4, 5, 6, 7, 1, 2, 3]


// // Array
// // rotationTime


// // Time O(n) | Space O(1). => n will be number of rotation | N => num of rotation
// const rotateArr = (arr, rotation) => {
   
//   // base
   
//     rotation = rotation % arr.length
//   // if (rotation > arr.length) { // 10 > 7
//   // }
   
  
//   // happy flow
//   // const subArr = arr.slice(0, rotation)
//   // const finalArr = []
   
   
//   const len = arr.length - 1
   
//   // 6 => 0 
//   // 5 => 1
//   // 4 => 2
//   for (let i = 0; i < rotation; i++) {
//     // arr[len - i] = arr[i]
    
//     arr[i] = arr[i + rotation]
    
//   }
   
//   return arr // [...arr, ...subArr]
// }
 
// const res = rotateArr(input, numToRotate)
 
// console.log(res)




