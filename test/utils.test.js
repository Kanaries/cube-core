const assert = require('assert');
const { sum, sum_unsafe, count } = require('../built/index.js')

describe('[utils]export aggregation func', () => {
  it('func exist', () => {
    assert.equal(typeof sum === 'function', true);
    assert.equal(typeof sum_unsafe === 'function', true);
    assert.equal(typeof count === 'function', true);
  })
})