

var Base = require('./base')
  , color = Base.color;


exports = module.exports = List;


function List(runner) {
  Base.call(this, runner);

  var self = this
    , stats = this.stats
    , n = 0;

  runner.on('start', function(){
    console.error();
  });

  runner.on('pass', function(test){
    console.error(color('pass', '  %s'), test.fullTitle());
  });

  runner.on('fail', function(test, err){
    console.error(color('fail', '  %d) %s'), n++, test.fullTitle());
  });

  runner.on('end', function(){
    console.error();
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