
const Base = require('./base')
const color = Base.color;

exports = module.exports = List;

function List(runner) {
  Base.call(this, runner);

  const self = this
  const stats = this.stats
  let n = 0;

  runner.on('start', function(){
    console.log();
  });

  runner.on('test', function(test){
    process.stdout.write(color('pass', '    ' + test.fullTitle() + ': '));
  });

  runner.on('pending', function(test){
    var fmt = color('checkmark', '  -')
      + color('pending', ' %s');
    console.log(fmt, test.fullTitle());
  });

  runner.on('pass', function(test){
    var fmt = color('checkmark', '  ✓')
      + color('pass', ' %s: ')
      + color(test.speed, '%dms');
    console.log('\r' + fmt, test.fullTitle(), test.duration);
  });

  runner.on('fail', function(test, err){
    console.log('\r' + color('fail', '  %d) %s'), n++, test.fullTitle());
  });

  runner.on('end', self.epilogue.bind(self));
}


List.prototype.__proto__ = Base.prototype;