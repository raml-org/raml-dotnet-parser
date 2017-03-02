/**
 * Generate a function that accepts a variable number of arguments as the last
 * function argument.
 *
 * @param  {Function} fn
 * @return {Function}
 */
module.exports = function (fn) {
  var count = Math.max(fn.length - 1, 0);

  return function () {
    var args = new Array(count);
    var index = 0;

    // https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
    for (; index < count; index++) {
      args[index] = arguments[index];
    }

    var variadic = args[count] = [];

    for (; index < arguments.length; index++) {
      variadic.push(arguments[index]);
    }

    return fn.apply(this, args);
  };
};
