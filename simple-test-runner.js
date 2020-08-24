const fs = require('fs')
const vm = require('vm')
const join = require('path').join
const file = process.argv[2]
const cwd = process.cwd();

fs.readFile(file, 'utf8', function(err, str) {
    if(err) throw err;
    const context = {require}
    for(let key in global) {
        context[key] = global[key]
    }
    const fileFullPath = require.resolve(join(cwd, file));
    vm.runInNewContext(str, context, fileFullPath)
})