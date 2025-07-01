import {arrayProblem} from "./array/index.js";
import readline from 'readline';

const ALREADY_SOLVED = 'Well done you have solve all problems'

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Helper function to get user input
const askQuestion = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
};

// helper function
const generateUniqueNumber = (limit, seen) => {
    if (seen.length >= limit) {
        return ALREADY_SOLVED
    }
    let random
    do {
        random = Math.floor(Math.random() * limit);
    } while (seen.includes(random))

    seen.push(random)

    return {seen, random};
}

// problem collections
const problemType = {
    array: arrayProblem
}

// active problem solve
const topic = [
    'array',
    // 'string',
    // 'linkedList',
]

const alreadySolved = []

const startPractice = async (topic) => {
    let problem = []
    topic.forEach((item) => {
        problem = [...problem, ...problemType[item]]
    })

    const totalProblem = problem.length;

    let uniqueProblem = generateUniqueNumber(totalProblem, alreadySolved)

    while (uniqueProblem !== ALREADY_SOLVED) {
        let idx = uniqueProblem.random;
        
        console.log('Problem => ', problem[idx][0].problem);
        console.log('Input => ', problem[idx][0].inputs[0]);
        console.log('Expected Output => ', problem[idx][0].outputs[0]);
        console.log('Input Format => ', problem[idx][0].inputFormat);

        let solutionPassed = false;
        let attempts = 0;
        const maxAttempts = 3;

        while (!solutionPassed && attempts < maxAttempts) {
            console.log(`\nAttempt ${attempts}/${maxAttempts}`);
            let userChoice = await askQuestion('\nEnter \nr => run to run test \ns => skip to skip this problem \nq => quit to exit \n: ');

            userChoice = userChoice.toLowerCase()

            if (['run', 'r'].includes(userChoice)) {
                console.log('\nRunning test...\n');
                try {
                    const { SOLUTIONS } = await import(`./solution.js?update=${Date.now()}`);
                    const testResult = problem[idx][1].runTest(SOLUTIONS);

                    if (testResult.passed) {
                        console.log('✅ All test cases passed!\n Moving to next question...\n');
                        solutionPassed = true;
                    } else {
                        console.log('\nProblem => ', problem[idx][0].problem);
                        console.log('❌ Test case failed!');
                        console.log(`Failed at test case ${testResult.testCaseIndex + 1}:`);
                        console.log(`Input: ${JSON.stringify(testResult.input)}`);
                        console.log(`Your Output: ${JSON.stringify(testResult.yourOutput)}`);
                        console.log(`Expected Output: ${JSON.stringify(testResult.expectedOutput)}`);
                        attempts++;
                    }
                } catch (err) {
                    console.error('Error reloading solutions:', err);
                    attempts++;
                }
            } else if (['skip', 's'].includes(userChoice)) {
                console.log('Skipping this problem...\n');
                break;
            } else if (['quit', 'q'].includes(userChoice)) {
                console.log('Goodbye!');
                rl.close();
                return;
            }
        }

        if (!solutionPassed) {
            console.log('\nMaximum attempts reached. Moving to next problem...\n');
        }

        uniqueProblem = generateUniqueNumber(totalProblem, alreadySolved)
    }

    console.log(ALREADY_SOLVED);
    rl.close();
}

startPractice(topic)