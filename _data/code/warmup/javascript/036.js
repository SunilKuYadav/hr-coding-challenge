// How do you find the length of the longest substring without repeating characters ?


const input = "sunilkumaryadav"

// Time O(end - start)
// Space O(256)
const distinct = (str, start, end) => {
    const visited = new Array(256);
    for (let i = start; i <= end; i++) {
        if (visited[str.charCodeAt(i)] === true) {
            return false;
        }
        visited[str.charCodeAt(i)] = true;
    }
    return true;
}

// Time O(n^3)
// Space O(256)
const longestUniqueSubstring = str => {
    const len = str.length;
    let result = 0;
    for (let i = 0; i < len; i++) {
        for (let j = i; j < len; j++) {
            if (distinct(str, i, j)) {
                result = Math.max(result, j - i + 1)
            }
        }
    }
    return result;
}

// Time O(n^2)
// Space O(256)
const longestUniqueSubstring1 = str => {
    const len = str.length;
    let result = 0;
    for (let i = 0; i < len; i++) {
        const visited = new Array(256);
        for (let j = i; j < len; j++) {
            if (visited[str.charCodeAt(j)] === true) {
                break;
            } else {
                result = Math.max(result, j - i + 1)
                visited[str.charCodeAt(j)] = true;
            }
        }
    }
    return result;
}

// Time O(n)
// Space O(256)
const longestUniqueSubstring3 = str => {
    const len = str.length;
    if (len === 0) {
        return 0;
    }
    if (len === 1) {
        return 1;
    }

    const visited = new Array(256);
    visited.fill(false);

    let result = 0,
        left = 0,
        right = 0;

    for (; right < len; right++) {
        if (visited[str.charCodeAt(right)] === false) {
            visited[str.charCodeAt(right)] = true;
        } else {
            result = Math.max(result, (right - left));
            while (left < right) {
                if (str.charCodeAt(left) != str.charCodeAt(right))
                    visited[str.charCodeAt(left)] = false;
                else {
                    left++;
                    break;
                }
                left++;
            }
        }
    }
    result = Math.max(result, (right - left))
    return result;
}

const out = longestUniqueSubstring(input);
console.log(out);

const out1 = longestUniqueSubstring1(input);
console.log(out1);

const out3 = longestUniqueSubstring3(input);
console.log(out3);