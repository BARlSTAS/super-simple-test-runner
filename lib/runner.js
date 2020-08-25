var EventEmitter = require('events').EventEmitter;

module.exports = Runner;

function Runner(suite) {
  this.suite = suite;
  this.total = suite.total();
}

Runner.prototype.__proto__ = EventEmitter.prototype;

Runner.prototype.runTests = function(suite, fn){
  const self = this
  const tests = suite.tests;

  function run(test) {
    if (!test) return fn();
    self.emit('test', test);

    // run the test
    try {
      // async
      if (test.async) {
        test.run(function(err){
          if (err) {
            test.failed = true
            self.emit('fail', test, err);
          } else {
            self.emit('pass', test);
          }
          self.emit('test end', test);
          run(tests.shift());
        });
      // sync  
      } else {
        test.run();
        test.passed = true;
        self.emit('pass', test);
      }
    } catch (err) {
      test.failed = true;
      self.emit('fail', test, err);
    }

    // run the next test
    if (test.sync) {
      self.emit('test end', test);
      run(tests.shift());
    }
  }

  run(tests.shift());
};

Runner.prototype.runSuite = function(suite, fn){
  var self = this;

  this.emit('suite', suite);

  var pending = suite.suites.length + 1;
  suite.suites.forEach(function(suite){
    self.runSuite(suite, function(){
      --pending || fn();
    });
  });

  this.runTests(suite, function(){
    --pending || fn();
  });
};

Runner.prototype.run = function(){
  var self = this;
  this.emit('start');
  this.runSuite(this.suite, function(){
    self.emit('end');
  });
  return this;
};
