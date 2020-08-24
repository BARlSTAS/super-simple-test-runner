const assert = require('assert')

describe('number', function(){
      it('compare 1 and 1', function(){
        assert.equal(1,1)
      }); 
      it('sum 1 and 1', function(){
        assert.equal(1+1,2)
      }); 
});

describe('string', function(){
    it('compare 1 and 1', function(){
      assert.equal('1','1')
      }); 
      it('compare a and a', function(){
        assert.equal('a','a')
      }); 
});
