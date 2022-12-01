const obj = {
  a: 1,
  z: 2,
  d: 3,
  f: {
    x: 1,
    y: 2,
    c: 3,
  },
  g: {
    a: 1,
    z: 2,
    c: {
      x: 2,
      y: 3,
      a: {
        a: 1,
        z: 2,
        c: {
          p: 9,
        },
      },
    },
  },
};

const depthObj = (obj) => 1 + Math.max(-1, ...Object.values(obj).map(depthObj));

const depthOf = (object) => {
  let level = 1;
  for (let key in object) {
    if (!object.hasOwnProperty(key)) continue;

    if (typeof object[key] == "object") {
      const depth = depthOf(object[key]) + 1;
      level = Math.max(depth, level);
    }
  }
  return level;
};

console.log(depthObj(obj));
console.log(depthOf(obj));
