
var EventEmitter = require('events').EventEmitter;


exports = module.exports = Suite;

var map = {};

exports.create = function(parent, title){
  var suite = new Suite(title);
  suite.parent = parent;
  title = suite.fullTitle();
  if (map[title]) return map[title];
  parent.addSuite(suite);
  return map[title] = suite;
};


function Suite(title) {
  this.title = title;
  this.suites = [];
  this.tests = [];
  this.beforeAllCallbacks = [];
  this.beforeEachCallbacks = [];
  this.afterAllCallbacks = [];
  this.afterEachCallbacks = [];
  this.root = !title;
}

Suite.prototype.__proto__ = EventEmitter.prototype;

Suite.prototype.timeout = function(ms){
  if (String(ms).match(/s$/)) ms = parseFloat(ms) * 1000;
  this._timeout = parseInt(ms, 10);
  return this;
};

Suite.prototype.beforeAll = function(fn){
  this.beforeAllCallbacks.push(fn);
  this.emit('beforeAll', fn);
  return this;
};


Suite.prototype.afterAll = function(fn){
  this.afterAllCallbacks.push(fn);
  this.emit('afterAll', fn);
  return this;
};


Suite.prototype.beforeEach = function(fn){
  this.beforeEachCallbacks.push(fn);
  this.emit('beforeEach', fn);
  return this;
};


Suite.prototype.afterEach = function(fn){
  this.afterEachCallbacks.push(fn);
  this.emit('afterEach', fn);
  return this;
};

Suite.prototype.addSuite = function(suite){
  suite.parent = this;
  if (this._timeout) suite.timeout(this._timeout);
  this.suites.push(suite);
  this.emit('suite', suite);
  return this;
};


Suite.prototype.addTest = function(test){
  test.parent = this;
  if (this._timeout) test.timeout(this._timeout);
  this.tests.push(test);
  this.emit('test', test);
  return this;
};


Suite.prototype.fullTitle = function(){
  if (this.parent) {
    var full = this.parent.fullTitle();
    if (full) return full + ' ' + this.title;
  }
  return this.title;
};


Suite.prototype.total = function(){
  return this.suites.reduce(function(sum, suite){
    return sum + suite.total();
  }, 0) + this.tests.length;
};
