const reject = [false, false, false];

const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject[0]
      ? reject("Hi, I am p1 with 1 sec reject")
      : resolve("Hi, I am p1 with 1 sec delay");
  }, 1000);
});

const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject[1]
      ? reject("Hi, I am p2 with 2 sec reject")
      : resolve("Hi, I am p2 with 2 sec delay");
  }, 2000);
});

const p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject[2]
      ? reject("Hi, I am p3 with 3 sec reject")
      : resolve("Hi, I am p3 with 3 sec delay");
  }, 3000);
});


Promise.all([p1, p2, p3])
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
