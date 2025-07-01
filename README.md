# DSA Practice System

A dynamic Data Structures and Algorithms practice system that allows you to solve problems and test your solutions in real-time.

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation
1. Clone or download the project
2. Navigate to the project directory:
   ```bash
   cd dsa
   ```
3. Install dependencies (if any):
   ```bash
   npm install
   ```

### Running the Application
```bash
node runFile.js
```

## 📖 How to Use

### 1. Problem Selection
The system will randomly select problems from the available categories:
- **Array Problems** (currently active)
- String Problems (commented out)
- Linked List Problems (commented out)

### 2. Problem Display
For each problem, you'll see:
- **Problem Name**: Description of what you need to solve
- **Input**: Sample input data
- **Expected Output**: What your solution should return
- **Input Format**: How the input parameters are structured

### 3. Available Commands
When prompted, you can use these commands:

| Command | Action |
|---------|--------|
| `r` or `run` | Run your current solution against test cases |
| `s` or `skip` | Skip to the next problem |
| `q` or `quit` | Exit the application |

### 4. Solving Problems

#### Step 1: Understand the Problem
Read the problem description, input format, and expected output carefully.

#### Step 2: Write Your Solution
Open `solution.js` in your preferred code editor and modify the `solve` function:

```javascript
function solve(arr) {
    // Your solution code here
    // Update the parameters as needed based on the problem
    
    // Example: Reverse an array
    return arr.reverse();
}
```

#### Step 3: Test Your Solution
1. Save your changes in `solution.js`
2. Go back to the running application
3. Type `r` and press Enter to run the test
4. The system will automatically reload your updated solution

#### Step 4: Iterate
- If tests fail, you'll see detailed error information
- Modify your solution and test again
- You have 3 attempts per problem before it moves to the next one

## 🔧 Features

### Dynamic Solution Loading
- **Real-time Updates**: Modify your solution while the program is running
- **Automatic Reload**: No need to restart the application
- **Live Testing**: Test changes immediately

### Smart Test System
- **First Failure Focus**: Shows only the first failed test case
- **Detailed Error Information**: Input, your output, and expected output
- **Attempt Limiting**: Maximum 3 attempts per problem to prevent getting stuck

### Problem Categories
- **Array Problems**: 7 problems covering various array manipulation techniques
- **String Problems**: 3 problems for string algorithms
- **Linked List Problems**: 3 problems for linked list operations

## 📁 Project Structure

```
dsa/
├── runFile.js          # Main application file
├── solution.js         # Your solution file (modify this)
├── helperUtils.js      # Utility functions
├── array/              # Array problems
│   ├── index.js        # Array problem collection
│   ├── _01.js          # Problem definitions
│   ├── _01_01.js       # Test cases
│   └── ...             # More problems
├── string/             # String problems
├── linked-lists/       # Linked list problems
└── README.md           # This file
```

## 🎯 Problem Types

### Array Problems
1. **Reverse an Array/String** - Basic array reversal
2. **Two Number Sum** - Find pairs that sum to target
3. **Three Number Sum** - Find triplets that sum to target
4. **Smallest Difference** - Find smallest difference between two arrays
5. **Monotonic Array** - Check if array is monotonic
6. **Spiral Traverse** - Traverse 2D array in spiral order
7. **Longest Peak** - Find longest peak in array

### String Problems
1. **Palindrome Check** - Check if string is palindrome
2. **Longest Palindromic Substring** - Find longest palindrome substring
3. **Longest Substring Without Repeating Characters** - Find longest unique substring

### Linked List Problems
1. **Remove Nth Node From End** - Remove node from end of list
2. **Detect Cycle** - Detect cycle in linked list
3. **Reverse Linked List** - Reverse a linked list

## 💡 Tips for Success

1. **Read Carefully**: Understand the input format and expected output
2. **Start Simple**: Begin with basic approaches, then optimize
3. **Test Incrementally**: Test your solution after each significant change
4. **Use the Error Information**: Pay attention to the detailed failure information
5. **Don't Get Stuck**: Use the skip option if you're struggling with a problem

## 🔄 Customization

### Adding New Problem Categories
1. Create a new folder (e.g., `trees/`)
2. Add problem files following the naming convention
3. Update `runFile.js` to include the new category

### Modifying Problem Selection
Edit the `topic` array in `runFile.js`:
```javascript
const topic = [
    'array',
    'string',        // Uncomment to include string problems
    'linkedList',    // Uncomment to include linked list problems
]
```

### Changing Attempt Limit
Modify the `maxAttempts` constant in `runFile.js`:
```javascript
const maxAttempts = 5; // Change from 3 to any number
```

## 🐛 Troubleshooting

### Common Issues

**"Error reloading solutions"**
- Make sure `solution.js` has valid JavaScript syntax
- Check that the `solve` function is properly exported

**"Module not found"**
- Ensure you're running the command from the correct directory
- Check that all files are present

**Tests not updating**
- Make sure you save `solution.js` after making changes
- The system should automatically reload on each test run

## 📝 Example Workflow

1. **Start the application**:
   ```bash
   node runFile.js
   ```

2. **Read the problem**:
   ```
   Problem => Reverse an Array/String
   Input => [1, 4, 3, 2, 6, 5]
   Expected Output => [5, 6, 2, 3, 4, 1]
   ```

3. **Write your solution** in `solution.js`:
   ```javascript
   function solve(arr) {
       return arr.reverse();
   }
   ```

4. **Test your solution**:
  - Type `r` and press Enter
  - See the results

5. **Iterate and improve** until all tests pass!

## 🎉 Happy Coding!

This system is designed to help you practice DSA problems efficiently. Take your time, understand the problems, and enjoy the learning process! 