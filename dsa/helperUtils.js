const makeDeepCopy = input => JSON.parse(JSON.stringify(input))
const stringify = input => JSON.stringify(input)



export {
    makeDeepCopy,
    stringify
}