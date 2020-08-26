const assert = require('assert')

describe('durations', function(){
    it('1 to 1', function(){
        assert.equal('1','1')
    })

    it('2 to 2', function(){
        assert.equal(2,2)
    })

    it('3 to 4', function(){
        assert.equal(3,4)
    })
})