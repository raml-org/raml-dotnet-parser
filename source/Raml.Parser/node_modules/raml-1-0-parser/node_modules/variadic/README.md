# Variadic

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Gittip][gittip-image]][gittip-url]

Return a function that accepts a variable number of arguments as the last parameter.

## Installation

```
npm install variadic --save
```

## Usage

```javascript
var variadic = require('variadic');

var fn = variadic(function (args) {
  return args;
});

fn(); //=> []
fn('a'); //=> ['a']
fn('a', 'b') //=> ['a', 'b'];

var fn = variadic(function (a, b, args) {
  return { a: a, b: b, args: args };
});

fn(); //=> { a: undefined, b: undefined, args: [] }
fn('a'); //=> { a: 'a', b: undefined, args: [] }
fn('a', 'b', 'c', 'd', 'e'); //=> { a: 'a', b: 'b', args: ['c', 'd', 'e'] }
```

## License

MIT

[npm-image]: https://img.shields.io/npm/v/variadic.svg?style=flat
[npm-url]: https://npmjs.org/package/variadic
[travis-image]: https://img.shields.io/travis/blakeembrey/variadic.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/variadic
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/variadic.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/variadic?branch=master
[gittip-image]: https://img.shields.io/gittip/blakeembrey.svg?style=flat
[gittip-url]: https://www.gittip.com/blakeembrey
