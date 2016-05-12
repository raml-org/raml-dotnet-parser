var arity    = require('util-arity');
var variadic = require('variadic');

/**
 * Wrap a function with default arguments for partial application.
 *
 * @param  {Function} fn
 * @param  {*}        ...
 * @return {Function}
 */
module.exports = variadic(function (fn, args) {
  var remaining = Math.max(fn.length - args.length, 0);

  return arity(remaining, variadic(function (called) {
    return fn.apply(this, args.concat(called));
  }));
});
