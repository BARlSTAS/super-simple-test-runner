
const Suite = require('./suite')
const Test = require('./test');

module.exports = function(suite){
  const suites = [suite];
  suite.on('file', function(context, file){
    context.describe = function(title, fn){
      const suite = new Suite(title);
      suites[0].addSuite(suite)
      suites.unshift(suite);
      fn();
      suites.shift();
    };

    context.it = function(title, fn){
      suites[0].addTest(new Test(title, fn));
    };
  });
};