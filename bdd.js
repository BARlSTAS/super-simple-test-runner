
var Suite = require('./suite')
var Test = require('./test');

module.exports = function(suite){
  var suites = [suite];

  suite.on('file', function(context, file){
    context.describe = function(title, fn){
      var suite = suite = new Suite(title);
      suites[0].addSuite(suite);
      suites.unshift(suite);
      fn();
      suites.shift();
    };

    context.it = function(title, fn){
      suites[0].addTest(new Test(title, fn));
    };
  });
};