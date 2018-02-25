var assert = require('assert');
describe('MPG', function() {
  describe('GetListCard', function() {
      var ind=new (require('./index.js'))({},)
    it('should return -1 when the value is not present', function() {
      assert.equal([1,2,3].indexOf(4), -1);
    });
  });
});