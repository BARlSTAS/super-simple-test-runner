

const Reporter = require('./reporter')
const color = Reporter.color;


exports = module.exports = List;


function List(runner) {
  Reporter.call(this, runner);

  const self = this
  const stats = this.stats
  const n = 0;

  runner.on('start', function(){
  });

  runner.on('pass', function(test){
    console.error(color('pass', '  %s'), test.fullTitle());
  });

  runner.on('fail', function(test, err){
    console.error(color('fail', '  %d) %s'), n++, test.fullTitle());
  });

  runner.on('end', function(){
    if (stats.failures) {
      console.error(color('fail message', '  ✖ %d of %d tests failed'), stats.failures, stats.tests);
      Reporter.list(self.failures);
    } else {
      console.error(color('pass message', '  ✔ %d tests completed in %dms'), stats.tests, stats.duration);
    }
    console.error();
    process.exit(stats.failures);
  });
}