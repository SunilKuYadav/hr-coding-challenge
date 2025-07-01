const makeDeepCopy = input => JSON.parse(JSON.stringify(input))

const deepEqual = (a, b) => {
    if (a === b) return true;

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        return a.every((val, i) => deepEqual(val, b[i]));
    }

    if (typeof a === 'object' && typeof b === 'object' && a && b) {
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length !== keysB.length) return false;
        return keysA.every(key => deepEqual(a[key], b[key]));
    }

    return false;
}


class SinglyNode {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}
const createSinglyList = (data) => {
    if (data.length === 0) return null

    let head = new SinglyNode(data[0])
    let current = head

    for (let i = 1; i < data.length; i++) {
        current.next = new SinglyNode(data[i])
        current = current.next
    }

    return  head

}
const areSinglyListIsEqual = (head1, head2) =>{
    let current1 = head1
    let current2 = head2

    while (current1 !== null && current2 !== null) {
        if (current1.data !== current2.data) {
            return false
        }
        current1 = current1.next
        current2 = current2.next
    }
    return current1 === null && current2 === null;
}
const printSinglyList = (head) => {
    let current = head;
    const values = [];

    while (current !== null) {
        values.push(current.data);
        current = current.next;
    }

    console.log(values.join(" -> "));
}
const isValidSinglyList = (head) => {
    let current = head;
    const seenNode = new Set()

    while (current !== null) {
        if (typeof current !== 'object' || !('data' in current) ||
            !('next' in current)) {
            return null
        }

        if (seenNode.has(current)) {
            return null
        }

        seenNode.add(current)
        current = current.next;
    }
    return head
}
const createCyclicSinglyList = (data, position) => {
    if (data.length === 0) return {head: null, cyclicNode: null}

    const head = new SinglyNode(data[0])
    let current = head
    let cyclicNode = null

    for (let i = 1; i < data.length; i++) {
        const newNode = new SinglyNode(data[i])
        current.next = newNode
        current = newNode

        if(i === position) {
            cyclicNode = newNode
        }
    }

    if (position === 0) {
        cyclicNode = head
    }

    if (position >= 0) {
        current.next = cyclicNode
    }

    return {head, cyclicNode}
}
const LinkedList = {
    SinglyNode,
    isValidSinglyList,
    printSinglyList,
    createSinglyList,
    areSinglyListIsEqual,
    createCyclicSinglyList
}

export {
    makeDeepCopy,
    deepEqual,
    LinkedList
}