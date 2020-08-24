

var Base = require('./base')
  , color = Base.color;

exports = module.exports = Reporter;

function Reporter(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , width = Base.window * .75 | 0
    , n = 0;

  runner.on('start', function(){
    process.stdout.write('\n  ');
  });

  runner.on('pass', function(test){
    if (++n % width == 0) process.stdout.write('\n  ');
    process.stdout.write(color('pass', '.'));
  });

  runner.on('fail', function(test, err){
    if (++n % width == 0) process.stdout.write('\n  ');
    process.stdout.write(color('fail', '.'));
  });

 
  runner.on('end', function(){
    console.error('\n');
    if (stats.failures) {
      console.error(color('fail message', '  ✖ %d of %d tests failed'), stats.failures, stats.tests);
      Base.list(self.failures);
    } else {
      console.error(color('pass message', '  ✔ %d tests completed in %dms'), stats.tests, stats.duration);
    }
    console.error();
    process.exit(stats.failures);
  });
}