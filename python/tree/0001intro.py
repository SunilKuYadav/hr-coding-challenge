### https://www.geeksforgeeks.org/introduction-to-binary-tree-data-structure-and-algorithm-tutorials/
### https://www.geeksforgeeks.org/binary-tree-set-2-properties/
## https://www.geeksforgeeks.org/binary-tree-set-3-types-of-binary-tree/
"""
# A Tree is a popular data structure that is non-linear in nature. Unlike other data structure like array, stack, queue, and linked kist which are linear in nature, a tree represents a hierarchical structure. The ordering information of a tree is not importents. A tree contains nodes and two pointers. These two pointer are the left and the right child of the parent node. Let us understand the terms of tree in detail.
    1. Root: The root of a tree is the topmost node of the tree that has no parent node. There is only one root node in every tree.
    2. Edge: Edge acts as a link between the parent node and the child node.
    3. Leaf: A node that has no child is known as the leaf node. It is the last node of the tree. There can be multiple leaf nodes in a tree.
    4. Subtree: The subtree of a node is the tree considering that particular node as the root node.
    5. Depth: The depth of the node is the distance from the root node to that particular node.
    6. Height: The height of the node is the distance from the node to the deepest node of that subtree.
    7. Height of Tree: The Height of tree is maximum height of any node. This is same as the height of root node.
"""


"""
# Why Use Trees?
    1. One reason to use trees might be because you want to store information that naturally forms a hierarchy. For example, the file system on a computer -
    2. Tree (with some ordering e.g., BST) provide moderate access/search (quicker than Linked List and slower than arrays).
    3. Tree provide moderate insertion/delation (quicker than Arrays and slower than Unordered Linked Lists).
    4. Like Linked Lists and unlike Arrays, Trees don't have an upper limit on the number of nodes as nodes are linked using pointer.
"""

"""
# Main applications of tree include:
    1. Manipulate heirarcchial data.
    2. Make information easy to search (see tree traversal).
    3. Manipulate sorted lists of data.
    4. As a workflow for compositing digital images for visual effects.
    5. Router algorithms
    6. Form of multi-stage decision-making (see business chess).
"""


# Create a Node
from nntplib import NNTPDataError


class Node:
    def __init__(self, key):
        self.left = None
        self.right = None
        self.val = key

"""
# Basic Operation On Binary Tree:
    1. Inserting an element.
    2. Removing an element.
    3. Searching for an element.
    4. Travering an element. There are three types of traversals in a binary tree which will be discussed ahead.
# Auxiliary Operation On Binary Tree:
    1. Finding the height of the tree
    2. Find the level of the tree
    3. Finding the size of the entire tree
# Application of Binary Tree:
    1. In compilers, Expression Trees are used which is an application of binary tree.
    2. Huffman coding trees are used in data compression algoriths.
    3. Priority Queue is another application of binary that is used for searching maximum or minimum in O(1) time complexity.
"""

"""
# Binary Tree Traversals:
    1. PreOrder Traversal: Here, the traversal is: root => left child => right child. It means that the root node is travesed first then left and finally the right child.
    2. InOrder Traversal: Here, the traversal is: left child => root => right child. It means that the left child is traversed first than its root and finally the right child.
    3. PostOrder Traversal: Here, the traversal is: left child => right child => root. It means that the left child is traversed first than the  right child and finally its root node.
"""

'''
                 1 //Root Node
                / \
               2    3
              / \  / \
             4  5  6  7 //Leaf Nodes

PreOrder Traversal of the above tree: 1-2-4-5-3-6-7
InOrder Traversal of the above tree: 4-2-5-1-6-3-7
PostOrder Traversal of the above tree: 4-5-2-6-7-3-1
'''


"""
# The maximum number of nodes at level 'l' of a binary tree is 2^l.
for root, l = 0, number of nodes = 2^0 = 1

- Assume that the maximum number of nodes on level 'l' is 2^l
- Since in Binary tree every node has at most 2 children, next level would have twice node i.e. 
==============================================
|                                            |
|  number of node = 2 * 2^depth => depth > 0 |
|                                            |
==============================================

# The Maximum number of nodes in a binary tree of height 'h' is 2^h - 1.
if h = 1 then node is 1
path. Height of a tree with a single node is considered as 1. 
- This result can be derived from point 2 above. A tree has maximum nodes if all levels have maximum nodes. So maximum number of nodes in a binary tree of height h is 1 + 2 + 4 + .. + 2h-1. This is a simple geometric series with h terms and sum of this series is 2^h - 1. 
- In some books, the height of the root is considered as 0. In this convention, the above formula becomes 2^(h+1) - 1
======================================
|                                    |
|  number of node = 2^(height+1) - 1 |
|                                    |
======================================

# In a Binary Tree with N nodes, minimum possible height or the minimum number of levels is Log2(N+1).
- There should be at least one element on each level, so the height cannot be more than N. A binary tree of height h can have maximum 2h - 1 nodes (previous property). So the number of nodes will be less than or equal to this maximum value.
=================================================================
|    N <=  2h - 1                                               |
|    2h >= N+1                                                  |
|    log2(2h) >= log2(N+1)           (Taking log both sides)    |
|    hlog22 >= log2(N+1)       (h is an integer)                |
|    h  >= | log2(N+1) |                                        |
=================================================================
"""

# InOrder Traversal
def inorder(root):
    if not root:
        return 
    inorder(root.left)
    print(root.val)
    inorder(root.right)
# PreOrder Traversal
def preorder(root):
    if not root:
        return 
    print(root.val)
    inorder(root.left)
    inorder(root.right)
# PostOrder Traversal
def portorder(root):
    if not root:
        return 
    inorder(root.left)
    inorder(root.right)
    print(root.val)


# function for inserting a node in tree
def insert(root, key):
    if not root:
        return 
    q = []
    q.append(root)
    # Do level order traversal until we find an empty place
    while len(q):
        temp = q[0]
        q.pop(0)

        if(not temp.left):
            temp.left = Node(key)
            break
        else:
            q.append(temp.left)
        if not temp.right:
            temp.right = Node(key)
            break
        else:
            q.append(temp.right)

# function to delete the given deepest node (d_node) in binary tree
def delete(root, d_node):
    q = []
    q.append(root)
    while len(q):
        temp = q.pop(0)
        if temp is d_node:
            temp = None
            return
        if temp.right:
            if temp.right is d_node:
                temp.right = None
                return
            else:
                q.append(temp.right)
        if temp.left:
            if temp.left is d_node:
                temp.left = None
                return
            else:
                q.append(temp.left)
    
# function to delete element in binary tree
def delation(root, key):
    if root == None:
        return 
    if root.left == None and root.right == None:
        if root.key == key:
            return None
        else:
            return root
    key_node = None
    q = []
    q.append(root)
    temp = None
    while len(q):
        temp = q.pop(0)
        if temp.data == key:
            key_node = temp
        if temp.left:
            q.append(temp.left)
        if temp.right:
            q.append(temp.right)
    if key_node:
        x = temp.data
        delete(root, temp)
        key_node.data = x
    return root

# updated function for delate the node in tree
def deleteNode(root, key):
    if root == None:
        return None
    if root.left == None and root.right == None:
        if root.val == key:
            return None
        else:
            return root
    key_node = None
    temp = None
    last = None
    q = []
    q.append(root)
    while len(q):
        temp = q.pop(0)
        if temp.data == key:
            key_node = temp
        if temp.left:
            last = temp # storing the parent node
            q.append(temp.left)
        if temp.right:
            last = temp # storing the parent node
            q.append(temp.right)
    if key_node != None:
        key_node.data = temp.data
        if last.right == temp:
            last.right = None
        else:
            last.left = None
    return root


# start the code
root = Node(1)
root.left = Node(2)
root.right = Node(3)

root.left.left = Node(4)
root.left.right = Node(5)

root.right.left = Node(6)
root.right.right = Node(7)

print('Inorder - ')
inorder(root)
insert(root, 12)
print('Inorder - ')
inorder(root)