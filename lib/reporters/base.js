

const tty = require('tty');


const isatty = tty.isatty(1) && tty.isatty(2);


exports = module.exports = Base;


exports.useColors = isatty;

exports.colors = {
    'pass': 90
  , 'fail': 31
  , 'bright pass': 92
  , 'bright fail': 91
  , 'bright yellow': 93
  , 'pending': 36
  , 'suite': '40'
  , 'error title': 0
  , 'error message': 31
  , 'error stack': 90
  , 'checkmark': 32
  , 'fast': 90
  , 'medium': 33
  , 'slow': 31
  , 'green': 32
  , 'light': 90
};

const color = exports.color = function(type, str) {
  if (!exports.useColors) return str;
  return '\033[' + exports.colors[type] + 'm' + str + '\033[0m';
};

exports.window = {
  width: isatty
    ? process.stdout.getWindowSize
      ? process.stdout.getWindowSize(1)[0]
      : tty.getWindowSize()[1]
    : 75
};


exports.cursor = {
  hide: function(){
    process.stdout.write('\033[?25l');
  },

  show: function(){
    process.stdout.write('\033[?25h');
  }
};

exports.slow = 75;


exports.list = function(failures){
  console.error();
  failures.forEach(function(test, i){
    // format
    const fmt = color('error title', '  %s) %s: ')
      + color('error message', '%s')
      + color('error stack', '\n%s\n');

    // msg
    let stack = test.err.stack
      , index = stack.indexOf('at')
      , msg = stack.slice(0, index);

    // indent stack trace without msg
    stack = stack.slice(index)
      .replace(/^/gm, '  ');

    console.error(fmt, i, test.fullTitle(), msg, stack);
  });
};


function Base(runner) {
  let self = this
    , stats = this.stats = { suites: 0, tests: 0, passes: 0, failures: 0 }
    , failures = this.failures = [];

  if (!runner) return;

  runner.on('start', function(){
    stats.start = new Date;
  });

  runner.on('suite', function(suite){
    stats.suites = stats.suites || 0;
    stats.suites++;
  });

  runner.on('test end', function(test){
    stats.tests = stats.tests || 0;
    stats.tests++;
  });

  runner.on('pass', function(test){
    stats.passes = stats.passes || 0;

    const medium = exports.slow / 2;
    test.speed = test.duration > exports.slow
      ? 'slow'
      : test.duration > medium
        ? 'medium'
        : 'fast';

    stats.passes++;
  });

  runner.on('fail', function(test, err){
    stats.failures = stats.failures || 0;
    stats.failures++;
    test.err = err;
    failures.push(test);
  });

  runner.on('end', function(){
    stats.end = new Date;
    stats.duration = new Date - stats.start;
  });
}

Base.prototype.epilogue = function(){
  let stats = this.stats
    , fmt;


  // failure
  if (stats.failures) {
    fmt = color('bright fail', '  ✖')
      + color('fail', ' %d of %d tests failed')
      + color('light', ':')

    console.error(fmt, stats.failures, stats.tests);
    Base.list(this.failures);
    console.error();
    process.nextTick(function(){
      process.exit(stats.failures);
    });
    return;
  }

  // pass
  fmt = color('bright pass', '  ✔')
    + color('green', ' %d tests complete')
    + color('light', ' (%dms)');

  console.log(fmt, stats.tests || 0, stats.duration);
  console.log();
  process.nextTick(function(){
    process.exit(0);
  });
};
