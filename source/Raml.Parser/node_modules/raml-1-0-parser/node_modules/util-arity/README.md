# Arity

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

Set a functions arity (the argument count) by proxying function calls.

## When would I use this?

It's unlikely you'll ever need to use this utility in everyday development. The reason I need it is for writing functional utilities and keeping compatibility with user expectations. For example, `curry` uses the function length to know how many times the function needs to be curried. Native utilities like `bind` also work in this fashion.

## Installation

```
npm install util-arity --save
```

## Usage

```javascript
var fn    = function () {};
var arity = require('util-arity');

var oneArg    = arity(1, fn);
var twoArgs   = arity(2, fn);
var threeArgs = arity(3, fn);

oneArgs.length; //=> 1
twoArgs.length; //=> 2
threeArgs.length; //=> 3
```

## TypeScript

The typings for this project are available for node module resolution with TypeScript.

## License

MIT

[npm-image]: https://img.shields.io/npm/v/util-arity.svg?style=flat
[npm-url]: https://npmjs.org/package/util-arity
[travis-image]: https://img.shields.io/travis/blakeembrey/arity.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/arity
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/arity.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/arity?branch=master
