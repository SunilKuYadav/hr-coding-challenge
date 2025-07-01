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
let totalScore = 0
let problemsAttempted = 0

const startPractice = async (topic) => {
    let problem = []
    topic.forEach((item) => {
        problem = [...problem, ...problemType[item]]
    })

    const totalProblem = problem.length;

    let uniqueProblem = generateUniqueNumber(totalProblem, alreadySolved)

    while (uniqueProblem !== ALREADY_SOLVED) {
        let idx = uniqueProblem.random;
        
        console.log('\n==========================================');
        console.log('Problem => ', problem[idx][0].problem);
        console.log('Input => ', problem[idx][0].inputs[0]);
        console.log('Expected Output => ', problem[idx][0].outputs[0]);
        console.log('Input Format => ', problem[idx][0].inputFormat);
        console.log('==========================================');

        let solutionPassed = false;
        let attempts = 0;
        const maxAttempts = 3;
        let problemScore = 0;

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
                        // Calculate score based on attempts
                        if (attempts === 0) {
                            problemScore = 15;
                        } else if (attempts === 1) {
                            problemScore = 10;
                        } else if (attempts === 2) {
                            problemScore = 5;
                        } else {
                            problemScore = 0;
                        }
                        
                        totalScore += problemScore;
                        problemsAttempted++;
                        
                        console.log(`✅ All test cases passed! Score: +${problemScore}\n Moving to next question...\n`);
                        console.log('==========================================');
                        solutionPassed = true;
                    } else {
                        console.log('\n==========================================');
                        console.log('Problem => ', problem[idx][0].problem);
                        console.log('❌ Test case failed!');
                        console.log(`Failed at test case ${testResult.testCaseIndex + 1}:`);
                        console.log(`Input: ${JSON.stringify(testResult.input)}`);
                        console.log(`Your Output: ${JSON.stringify(testResult.yourOutput)}`);
                        console.log(`Expected Output: ${JSON.stringify(testResult.expectedOutput)}`);
                        console.log('==========================================');
                        attempts++;
                    }
                } catch (err) {
                    console.error('Error reloading solutions:', err);
                    attempts++;
                }
            } else if (['skip', 's'].includes(userChoice)) {
                console.log('Skipping this problem...\n');
                console.log('==========================================');
                break;
            } else if (['quit', 'q'].includes(userChoice)) {
                console.log('==========================================');
                console.log('Goodbye!');
                console.log('\n📊 Final Score Summary:');
                console.log(`Problems Attempted: ${problemsAttempted}`);
                console.log(`Total Score: ${totalScore}`);
                if (problemsAttempted > 0) {
                    const averageScore = (totalScore / problemsAttempted).toFixed(1);
                    console.log(`Average Score per Problem: ${averageScore}`);
                }
                console.log('==========================================');
                rl.close();
                return;
            }
        }

        if (!solutionPassed) {
            console.log('\nMaximum attempts reached. Moving to next problem...\n');
            console.log('==========================================');
            problemsAttempted++; // Count as attempted even if not solved
        }

        uniqueProblem = generateUniqueNumber(totalProblem, alreadySolved)
    }

    console.log('\n==========================================');
    console.log(ALREADY_SOLVED);
    console.log('\n📊 Final Score Summary:');
    console.log(`Problems Attempted: ${problemsAttempted}`);
    console.log(`Total Score: ${totalScore}`);
    if (problemsAttempted > 0) {
        const averageScore = (totalScore / problemsAttempted).toFixed(1);
        console.log(`Average Score per Problem: ${averageScore}`);
    }
    console.log('==========================================');
    rl.close();
}

startPractice(topic)