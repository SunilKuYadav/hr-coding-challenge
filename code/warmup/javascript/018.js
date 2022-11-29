// Difference between a stable and unstable sorting algorithm?
//https://en.wikipedia.org/wiki/Sorting_algorithm#Stability:~:text=)2.-,Comparison%20sorts,-%5Bedit%5D

(async () => {
  const diff =
    "A Stable sort maintains the relative order of the items with equal sort key. An unstable sorting does not.";
  const statbleSorting = [
    "Steble sorting are",
    "Merge sort",
    "In-place merge sort",
    "Insertion sort",
    "Block sort",
    "Timsort",
    "Cubesort",
    "Bubble sort",
    "Tree sort",
  ];
  const unstatbleSorting = [
    "Unsteble sorting are",
    "Quicksort",
    "Introsort",
    "Heapsort",
    "Selection sort",
    "Shellsort",
    "Exchange sort",
    "Cycle sort",
  ];
  console.log(diff);
  let count = 0;
  const t = setInterval(() => {
    console.log(statbleSorting[count]);
    count++;
    if (count >= statbleSorting.length) {
      count = 0;
      clearInterval(t);
      d();
    }
  }, 1000);

  const d = () => {
    const t = setInterval(() => {
      console.log(unstatbleSorting[count]);
      count++;
      if (count >= unstatbleSorting.length) {
        clearInterval(t);
      }
    }, 1000);
  };
})();
