

var tty = require('tty');


var isatty = tty.isatty(1) && tty.isatty(2);


exports = module.exports = Base;



exports.useColors = isatty;



exports.colors = {
    'pass': 90
  , 'pass message': 32
  , 'fail': 31
  , 'fail message': 31
  , 'error title': 0
  , 'error message': 31
  , 'error stack': 90
};

var color = exports.color = function(type, str) {
  if (!exports.useColors) return str;
  return '\033[' + exports.colors[type] + 'm' + str + '\033[0m';
};





exports.cursor = {
  hide: function(){
    process.stdout.write('\033[?25l');
  },

  show: function(){
    process.stdout.write('\033[?25h');
  }
};

exports.list = function(failures){
  console.error();
  failures.forEach(function(test, i){
    var fmt = color('error title', '  %s) %s: ')
      + color('error message', '%s')
      + color('error stack', '\n%s\n');

    var stack = test.err.stack.replace(/^/gm, '  ');
    console.error(fmt, i, test.title, test.err.message, stack);
  });
};


process.on('SIGINT', function(){
  exports.cursor.show();
  console.log('\n');
  process.exit(1);
});

function Base(runner) {
  var self = this
    , stats = this.stats = {}
    , failures = this.failures = [];

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