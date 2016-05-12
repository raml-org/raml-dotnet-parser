/* global describe, it */

var assert   = require('assert');
var variadic = require('./');

describe('Variadic', function () {
  it('should pass arguments as an array', function () {
    var fn = variadic(function (a) {
      return a;
    });

    assert.deepEqual(fn(), []);
    assert.deepEqual(fn('a', 'b'), ['a', 'b']);
  });

  it('should pass all arguments as the first argument', function () {
    var fn = variadic(function () {
      return arguments;
    });

    assert.deepEqual(fn()[0], []);
    assert.deepEqual(fn('a', 'b')[0], ['a', 'b']);
  });

  it('should pass remaining arguments as the last parameter', function () {
    var fn = variadic(function (a, b, c) {
      return c;
    });

    assert.deepEqual(fn(), []);
    assert.deepEqual(fn('a', 'b'), []);
    assert.deepEqual(fn('a', 'b', 'c', 'd'), ['c', 'd']);
  });
});
