# Popsicle Cache

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

> Override the Popsicle transport mechanism with HTTP caching.

## Installation

```sh
npm install popsicle-cache --save
```

## Usage

```js
var popsicle = require('popsicle')
var cache = require('popsicle-cache')

popsicle('http://example.com')
  .use(cache())
  .then(function (res) {
    console.log(res) //=> If still fresh, the cached response, otherwise it makes a new request.
  })
```

**Options**

* **store** Custom (promise-based) store for response data (`Store` instance, default: `FileSystemStore`)
* **cache** Use a synchronous in-memory store (`number`, `false` or cache instance, default: `LRUCache({ max: 50000 })`)
* **staleFallback** Fallback to the stale response when the network is unavailable (default: `true`)

The built-in filesystem store handles race conditions by queuing file reads and writes.

**Please note:** Streaming response bodies are never cached.

## License

MIT license

[npm-image]: https://img.shields.io/npm/v/popsicle-cache.svg?style=flat
[npm-url]: https://npmjs.org/package/popsicle-cache
[downloads-image]: https://img.shields.io/npm/dm/popsicle-cache.svg?style=flat
[downloads-url]: https://npmjs.org/package/popsicle-cache
[travis-image]: https://img.shields.io/travis/blakeembrey/popsicle-cache.svg?style=flat
[travis-url]: https://travis-ci.org/blakeembrey/popsicle-cache
[coveralls-image]: https://img.shields.io/coveralls/blakeembrey/popsicle-cache.svg?style=flat
[coveralls-url]: https://coveralls.io/r/blakeembrey/popsicle-cache?branch=master
