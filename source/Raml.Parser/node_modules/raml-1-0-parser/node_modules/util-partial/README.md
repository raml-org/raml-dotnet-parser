# Partial

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Gittip][gittip-image]][gittip-url]

Partially apply a function by pre-filling some of its arguments and without changing the `this` context.

## Installation

```sh
npm install util-partial --save
```

## Usage

```javascript
var partial = require('util-partial');

var add = function (a, b) {
  return a + b;
};

var add5 = partial(add, 5);

add5(10); //=> 15
add5(20); //=> 25
add5(30); //=> 35
```

## Typings

Includes a [TypeScript type definition](partial.d.ts).

## License

MIT

[npm-image]: https://img.shields.io/npm/v/util-partial.svg?style=flat
[npm-url]: https://npmjs.org/package/util-partial
[travis-image]: https://img.shields.io/travis/blakeembrey/partial.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/partial
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/partial.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/partial?branch=master
[gittip-image]: https://img.shields.io/gittip/blakeembrey.svg?style=flat
[gittip-url]: https://www.gittip.com/blakeembrey
