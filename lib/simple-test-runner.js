const join = require('path').join
const reporter = require('./reporter') 
const interfaces = require('./bdd')
const Runner = require('./runner')
const Suite = require('./suite')
const vm = require('vm')
const fs = require('fs')
const cwd = process.cwd();

const suite = new Suite('')
interfaces(suite);

const FILE_PATH = process.argv[2]

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