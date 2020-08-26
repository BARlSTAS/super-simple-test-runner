const Suite = require('../suite')
const Test = require('../test');

module.exports = function(suite){
  const suites = [suite];

  suite.on('require', visit);

  function visit(obj) {
    let suite;
    for (let key in obj) {
      if ('function' == typeof obj[key]) {
        const fn = obj[key];
        switch (key) {
          case 'before':
            suites[0].beforeAll(fn);
            break;
          case 'after':
            suites[0].afterAll(fn);
            break;
          case 'beforeEach':
            suites[0].beforeEach(fn);
            break;
          case 'afterEach':
            suites[0].afterEach(fn);
            break;
          default:
            suites[0].addTest(new Test(key, fn));
        }
      } else {
        const suite = Suite.create(suites[0], key);
        suites.unshift(suite);
        visit(obj[key]);
        suites.shift();
      }
    }
  }
};