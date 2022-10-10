// helper functions
function addStr(str, index, stringToAdd) {
    return str.substring(0, index) + stringToAdd + str.substring(index, str.length);
}

function buildElements(python, javascript, sample, Problem_Link, Notes, Tags) {
    console.log(python, javascript, sample, Problem_Link, Notes, Tags)
    // $("#root").append("<pre><code class=" + "'python' >" + python + "</code ></pre /> ")

}


async function createElements(problem, name) {
    let pythonPath = addStr(problem.Solution.python, 1, './code')
    let javascriptPath = addStr(problem.Solution.javascript, 1, './code')
    let testPath = addStr(problem.Solution.test, 1, './code')
    let python = await $.get(pythonPath, function (data) {
        return data
    })
    let javascript = await $.get(javascriptPath, function (data) {
        return data
    })
    let sample = await $.get(testPath, function (data) {
        return data
    })
    $('#root').append(`
    <div>
        <h2>${name}</h2>
<iframe
 frameBorder="0"
 height="450px"  
 src="https://onecompiler.com/python/3yjewnpcq" 
 width="100%"
 ></iframe>
    </div>
    `)
    console.log(problem.Solution.py_link);
    return buildElements(python, javascript, sample, problem.Problem_Link, problem.Notes, problem.Tags);
}

function createSections(sectionData) {
    let problems = Object.keys(sectionData);
    problems.forEach(problemName => createElements(sectionData[problemName], problemName))
}

function formateTheData(data) {
    let Tags = Object.keys(data);
    Tags.forEach(key => createSections(data[key]))
}

(async () => {
    await $.getJSON('../code/index.json', function (data) {
        formateTheData(data);
    }).fail(function () {
        console.log('Something went wrong while reading data...');
    })
})();
