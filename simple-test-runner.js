// #!/usr/bin/env node

// const fs = require('fs')
// const vm = require('vm')
// const join = require('path').join
// const FILE_PATH = './test.js'
// const cwd = process.cwd();
// const Suite = require('./suite')
// const Runner = require('./runner')
// const Reporter = require('./reporter')

// const suite = new Suite('')
// const inerface = require('./bdd')
// inerface(suite)

// fs.readFile(FILE_PATH, 'utf8', function(err, str) {
//     if(err) throw err;

//     const context = {require}
//     for(let key in global) {
//         context[key] = global[key]
//     }
//     const fileFullPath = require.resolve(join(cwd, FILE_PATH));
//     suite.emit('file', context, FILE_PATH)
//     vm.runInNewContext(str, context, fileFullPath)
//     suite.emit('file end', context, FILE_PATH)
//     run(suite)
// })

// function run(suite) {
//     suite.emit('run');
//     var runner = new Runner(suite);
//     new Reporter(runner);
//     runner.run();
// }

var path = require('path')
var reporter = require('./reporter') 
var interfaces = require('./bdd')
var Runner = require('./runner')
var Suite = require('./suite')
var vm = require('vm')
var fs = require('fs')
var join = path.join
var cwd = process.cwd();

var suite = new Suite('')
var ui = interfaces(suite);

const FILE_PATH = './t.js'

fs.readFile(FILE_PATH, 'utf8', function(err, str) {
  if(err) throw err;

  const context = {require}
  for(let key in global) {
      context[key] = global[key]
  }
  const fileFullPath = require.resolve(join(cwd, FILE_PATH));
  suite.emit('file', context, FILE_PATH)
  vm.runInNewContext(str, context, fileFullPath)
  suite.emit('file end', context, FILE_PATH)
  run(suite)
})

function run(suite) {
  suite.emit('run');
  var runner = new Runner(suite);
  new reporter(runner);
  runner.run();
}