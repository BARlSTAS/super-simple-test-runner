

var EventEmitter = require('events').EventEmitter
  , Test = require('./test')
  , noop = function(){};

module.exports = Runner;


function Runner(suite) {
  var self = this;
  this.suite = suite;
  this.total = suite.total();
  this.globals = Object.keys(global).concat(['errno']);
  this.on('test end', function(){ self.checkGlobals(); });
  this.grep(/.*/);
}

Runner.prototype.__proto__ = EventEmitter.prototype;


Runner.prototype.grep = function(re){
  this._grep = re;
  return this;
};


Runner.prototype.checkGlobals = function(test){
  var leaks = Object.keys(global).filter(function(key){
    return !~this.globals.indexOf(key);
  }, this);

  this.globals = this.globals.concat(leaks);

  if (leaks.length > 1) {
    this.fail(test, new Error('global leaks detected: ' + leaks.join(', ') + ''));
  } else if (leaks.length) {
    this.fail(test, new Error('global leak detected: ' + leaks[0]));
  }
};


Runner.prototype.fail = function(test, err){
  test.failed = true;
  this.emit('fail', test, err);
};


Runner.prototype.failHook = function(hook, err){
  var test = new Test(hook + ' hook', noop);
  test.parent = this.suite;
  this.fail(test, err);
  this.emit('end');
  process.exit(0);
};


Runner.prototype.hook = function(name, fn){
  var suite = this.suite
    , test = this.test
    , callbacks = suite[name + 'Callbacks']
    , pending = callbacks.length;

  function next(i) {
    var callback = callbacks[i]
    if (!callback) return fn();

    // async
    if (1 == callback.length) {
      // async
      try {
        callback(function(err){
          if (err) return fn(err);
          next(++i);
        });
      } catch (err) {
        fn(err);
      }
      return;
    }

    // serial
    try {
      callback();
      process.nextTick(function(){
        next(++i);
      });
    } catch (err) {
      fn(err);
    }
  }

  process.nextTick(function(){
    next(0);
  });
};

Runner.prototype.hooks = function(name, suites, fn){
  var self = this
    , orig = this.suite;

  function next(suite) {
    self.suite = suite;

    if (!suite) {
      self.suite = orig;
      return fn();
    }

    self.hook(name, function(err){
      if (err) {
        self.suite = orig;
        return fn(err);
      }

      next(suites.pop());
    });
  }

  next(suites.pop());
};


Runner.prototype.hookUp = function(name, fn){
  var suites = [this.suite].concat(this.parents()).reverse();
  this.hooks(name, suites, fn);
};

Runner.prototype.hookDown = function(name, fn){
  var suites = [this.suite].concat(this.parents());
  this.hooks(name, suites, fn);
};


Runner.prototype.parents = function(){
  var suite = this.suite
    , suites = [];
  while (suite = suite.parent) suites.push(suite);
  return suites;
};

Runner.prototype.runTest = function(fn){
  var test = this.test
    , self = this;

  // async
  if (test.async) {
    try {
      return test.run(function(err){
        if (test.finished) {
          self.fail(test, new Error('done() called multiple times'));
          return;
        }
        fn(err);
      });
    } catch (err) {
      fn(err);
    }
  }

  // sync  
  process.nextTick(function(){
    try {
      test.run();
      fn();
    } catch (err) {
      fn(err);
    }
  });
};


Runner.prototype.runTests = function(suite, fn){
  var self = this
    , tests = suite.tests
    , test;

  function next(err) {
    // error handling
    if (err) {
      self.fail(test, err);
      self.emit('test end', test);
    }

    test = tests.shift();

    if (!test) return fn();

    if (!self._grep.test(test.fullTitle())) return next();

    if (test.pending) {
      self.emit('pending', test);
      self.emit('test end', test);
      return next();
    }

    self.emit('test', self.test = test);
    self.hookDown('beforeEach', function(err){
      if (err) return self.failHook('beforeEach', err);
      self.runTest(function(err){
        if (err) return next(err);
        self.emit('pass', test);
        test.passed = true;
        self.emit('test end', test);
        if (err) return self.failHook('beforeEach', err);
        self.hookUp('afterEach', function(err){
          if (err) return self.failHook('afterEach', err);
          next();
        });
      });
    });
  }

  next();
};

Runner.prototype.runSuite = function(suite, fn){
  var self = this
    , i = 0;

  this.emit('suite', this.suite = suite);

  function next() {
    var curr = suite.suites[i++];
    if (!curr) return done();
    self.runSuite(curr, next);
  }

  function done() {
    self.suite = suite;
    self.hook('afterAll', function(err){
      if (err) return self.failHook('afterAll', err);
      self.emit('suite end', suite);
      fn();
    });
  }

  this.hook('beforeAll', function(err){
    // TODO: use interface names
    if (err) return self.failHook('beforeAll', err);
    self.runTests(suite, next);
  });
};

Runner.prototype.run = function(){
  var self = this;

  this.emit('start');
  this.runSuite(this.suite, function(){
    self.emit('end');
  });

  process.on('uncaughtException', function(err){
    self.fail(self.test, err);
    self.emit('test end', self.test);
    self.emit('end');
  });

  return this;
};
