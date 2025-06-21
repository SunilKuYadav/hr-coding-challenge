// How to add an element at the middle of the linked list?

// import utils
const Utils = require("./utils");

// Time O(n)
// Space O(1)
const insertAtMiddleOfLL = (head, data) => {
  // new node
  const newNode = new Utils.SingleNode(data);
  let tempHead = head;
  let len = 0;

  // if LL is empty
  if (head == null) {
    head = newNode;
    return head;
  }

  // colculate length of LL
  while (tempHead !== null) {
    len++;
    tempHead = tempHead.next;
  }

  // conunt the number of node after which newNode will be insterted
  let count = len % 2 === 0 ? len / 2 : (len + 1) / 2;

  console.log(
    `Length of LL is ${len} and Insert ${data} at position : ${count}`
  );
  // update tempHead
  tempHead = head;
  // temp points to the node after which the new node is to be inserted
  while (count-- > 1) {
    tempHead = tempHead.next;
  }

  // insert the new node and adjust the required pointers
  newNode.next = tempHead.next;
  tempHead.next = newNode;

  return head;
};
const insertAtMiddleOfLLUsingTwoPointer = (head, data) => {
  // new node
  const newNode = new Utils.SingleNode(data);

  // if LL is empty
  if (head == null) {
    head = newNode;
    return head;
  }

  let slow = head;
  let fast = head.next;

  // colculate length of LL
  while (fast !== null && fast.next != null) {
    // move slow pointer to next node
    slow = slow.next;

    // move fast pointer two node at a time
    fast = fast.next.next;
  }

  // insert the new node and adjust the required pointers
  newNode.next = slow.next;
  slow.next = newNode;

  return head;
};

// driver code
let head = Utils.addSingleNode(null, 1);
Utils.addSingleNode(head, 2);
Utils.addSingleNode(head, 3);
Utils.addSingleNode(head, 7);
Utils.addSingleNode(head, 8);

console.log(`Original LL`);
Utils.printLinkedList(head);

head = insertAtMiddleOfLL(head, 4);
console.log(`Updated LL after 4 insert `);
Utils.printLinkedList(head);

head = insertAtMiddleOfLL(head, 5);
console.log(`Updated LL after 5 insert `);
Utils.printLinkedList(head);

head = insertAtMiddleOfLL(head, 6);
console.log(`Updated LL after 6 insert `);
Utils.printLinkedList(head);

// driver code
let head1 = Utils.addSingleNode(null, 1);
Utils.addSingleNode(head1, 2);
Utils.addSingleNode(head1, 3);
Utils.addSingleNode(head1, 7);
Utils.addSingleNode(head1, 8);

console.log(`Original LL`);
Utils.printLinkedList(head1);

head1 = insertAtMiddleOfLLUsingTwoPointer(head1, 4);
console.log(`Updated LL after 4 insert `);
Utils.printLinkedList(head1);

head1 = insertAtMiddleOfLLUsingTwoPointer(head1, 5);
console.log(`Updated LL after 5 insert `);
Utils.printLinkedList(head1);

head1 = insertAtMiddleOfLLUsingTwoPointer(head1, 6);
console.log(`Updated LL after 6 insert `);
Utils.printLinkedList(head1);
