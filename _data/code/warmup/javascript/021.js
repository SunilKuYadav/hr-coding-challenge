// How do you reverse a linked list in place?

// import utils
const Utils = require("./utils");

// Time O(n)
// Space O(1)
const reverseLL = (node) => {
  let prev = null;
  let current = node;
  let next = null;

  while (current != null) {
    // store the next node
    next = current.next;
    // update the next pointer of curr to prev
    current.next = prev;

    // update prev as curr and curr as next
    prev = current;
    current = next;
  }
  node = prev;
  return node;
};

// Time O(n)
// Space O(n)
const reverseLLTailRecursive = () => {};

// Time O(n)
// Space O(n)
const reverseLlStack = () => {};

// driver code
let head = new Utils.SingleNode(85);
head.next = new Utils.SingleNode(20);
head.next.next = new Utils.SingleNode(30);
head.next.next.next = new Utils.SingleNode(40);

console.log(`Original LL`);
Utils.printLinkedList(head);
head = reverseLL(head);
console.log("Reversed LL");
Utils.printLinkedList(head);

// driver code
let head1 = Utils.addSingleNode(null, 1);
Utils.addSingleNode(head1, 2);
Utils.addSingleNode(head1, 3);
Utils.addSingleNode(head1, 4);
Utils.addSingleNode(head1, 5);
Utils.addSingleNode(head1, 6);
Utils.addSingleNode(head1, 7);
Utils.addSingleNode(head1, 8);

console.log(`Original LL`);
Utils.printLinkedList(head1);
head1 = reverseLL(head1);
console.log("Reversed LL");
Utils.printLinkedList(head1);
