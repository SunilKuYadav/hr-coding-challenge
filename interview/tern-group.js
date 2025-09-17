const endorsements = [
    { skill: "css", user: "Bill" },
    { skill: "javascript", user: "Chad" },
    { skill: "javascript", user: "Bill" },
    { skill: "css", user: "Sue" },
    { skill: "javascript", user: "Sue" },
    { skill: "html", user: "Sue" },
    { skill: "html", user: "Sue" },
];

// loop endorsements
// store username
// if username already exist then we just going to add skill


const mapSkill = (arr) => {
    const map = new Map();
    const result = []

    for(let i = 0; i < arr.length; i++) {
        const item = arr[i]

        if (map.has(item.user)) {
            const skill = map.get(item.user)

            if(!skill.includes(item.skill)) {
                skill.push(item.skill)
            }
            map.set(item.user, skill)

        } else {
            map.set(item.user, [item.skill])

        }
        // [Bill, [css, javascript]]
        // [Chad, [javascript]]
        // [Sue, [css, javascript, html ]]
    }

    for (const [key, value] of map) {
        result.push({
            user: key,
            skill: value
        })
    }

    return result

}


console.log(mapSkill(endorsements))



// Output:
// [
//   {
//     "user": "Bill",
//     "skill": [
//       "css",
//       "javascript"
//     ]
//   },
//   {
//     "user": "Chad",
//     "skill": [
//       "javascript"
//     ]
//   },
//   {
//     "user": "Sue",
//     "skill": [
//       "css",
//       "javascript",
//       "html"
//     ]
//   }
// ]