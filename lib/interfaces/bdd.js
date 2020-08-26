

const Suite = require('../suite')
const Test = require('../test');


module.exports = function(suite){
  const suites = [suite];

  suite.on('pre-require', function(context){

    context.before = function(fn){
      suites[0].beforeAll(fn);
    };

    context.after = function(fn){
      suites[0].afterAll(fn);
    };

    context.beforeEach = function(fn){
      suites[0].beforeEach(fn);
    };

    context.afterEach = function(fn){
      suites[0].afterEach(fn);
    };
  
    context.describe = function(title, fn){
      var suite = Suite.create(suites[0], title);
      suites.unshift(suite);
      fn();
      suites.shift();
    };

    context.it = function(title, fn){
      suites[0].addTest(new Test(title, fn));
    };
  });
};
