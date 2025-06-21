// Singly LinkedList
class SingleNode {
  constructor(val) {
    this.data = val;
    this.next = null;
  }
}
const addSingleNode = (head, data) => {
  const temp = new SingleNode(data);

  // if LL is empty
  if (head === null) {
    head = temp;
    return head;
  } else {
    let lastNode = head;
    // loop until read at last node
    while (lastNode.next !== null) {
      lastNode = lastNode.next;
    }
    // add data
    lastNode.next = temp;
    return head;
  }
};
const printLinkedList = (node) => {
  let str = "";
  while (node != null) {
    str += `${node.data} `;
    node = node.next;
  }
  console.log(str);
};

module.exports = { printLinkedList, SingleNode, addSingleNode };
