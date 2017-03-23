var Promise = require('native-or-bluebird')
var join = require('path').join
var isStream = require('is-stream')
var stream = require('stream')
var tmpdir = require('os').tmpdir()
var fs = require('graceful-fs')
var LRUCache = require('lru-cache')
var thenify = require('thenify')
var dirname = require('path').dirname

/**
 * Promisify fs usages.
 */
var readFile = thenify(fs.readFile)
var writeFile = thenify(fs.writeFile)
var unlink = thenify(fs.unlink)
var mkdirp = thenify(require('mkdirp'))

/**
 * Cache into the filesystem.
 */
var TMP_PATH = join(tmpdir, 'popsicle-http-cache')

/**
 * Expose `popsicleCache`.
 */
module.exports = popsicleCache
module.exports.TMP_PATH = TMP_PATH
module.exports.Store = Store

/**
 * Create a popsicle cache instance, using a fs store by default.
 *
 * @param  {Object}   [options]
 * @return {Function}
 */
function popsicleCache (options) {
  options = options || {}

  var store = options.store || new Store({ path: TMP_PATH })
  var memoryCache = options.cache

  // Use an in-memory LRU cache by default.
  if (memoryCache == null || typeof memoryCache === 'number') {
    memoryCache = new LRUCache({ max: memoryCache || 50000, length: length })
  }

  return function (request) {
    var open = request.transport.open
    var key = request.fullUrl()

    // Override the open mechanism to look up the cache first.
    request.transport.open = function (request) {
      // Ignore non-cacheable methods (E.g. POST).
      if (!isCacheableMethod(request.method)) {
        return open(request)
      }

      function handle (_cache) {
        if (!_cache) {
          return open(request)
        }

        // Data is stored as JSON objects.
        var _response = _cache.response

        // Store the cached response data.
        request._cache = _cache

        // Handle fresh data as a server `304`.
        if (isFresh(_response.headers, _cache.timestamp)) {
          return Promise.resolve(notModified())
        }

        var etag = getProperty(_response.headers, 'etag')
        var lastModified = getProperty(_response.headers, 'last-modified')

        // Set the `If-None-Match` header.
        if (etag) {
          request.set('If-None-Match', etag)
        }

        // Set the `If-Modified-Since` header.
        if (lastModified) {
          request.set('If-Modified-Since', lastModified)
        }

        var _open = open(request)

        // Serve stale data when network is unreachable by default.
        if (options.staleFallback !== false) {
          return _open
            .catch(function (err) {
              return err.code === 'EUNAVAILABLE' ? notModified() : Promise.reject(err)
            })
        }

        return _open
      }

      var cache = memoryCache ? memoryCache.get(key) : null

      // Avoid trips to the more-costly storage, when available.
      if (cache) {
        return handle(cache)
      }

      return store.get(key).then(handle)
    }

    request.after(function (response) {
      var request = response.request
      var _cache = request._cache

      // Handle content that is already up to date.
      if (_cache && response.status === 304) {
        response.set(_cache.response.headers)
        response.url = _cache.response.url
        response.status = _cache.response.status
        response.body = _cache.response.body

        return
      }

      var now = Date.now()

      // Disable caching with certain responses.
      if (!isCacheableResponse(response, now)) {
        if (memoryCache) {
          memoryCache.del(key)
        }

        return store.del(key)
      }

      var data = {
        timestamp: now,
        response: response.toJSON()
      }

      if (memoryCache) {
        memoryCache.set(key, data)
      }

      return store.set(key, data)
    })
  }
}

/**
 * Check if response data is still fresh.
 *
 * @param  {Object}  headers
 * @param  {number}  timestamp
 * @return {boolean}
 */
function isFresh (headers, timestamp) {
  var now = Date.now()

  return Date.parse(getProperty(headers, 'expires')) > now ||
    getMaxAge(headers, timestamp) > now
}

/**
 * Get max age from headers.
 *
 * @param  {Object} headers
 * @param  {number} now
 * @return {number}
 */
function getMaxAge (headers, now) {
  return now + (parseMaxAge(getProperty(headers, 'cache-control')) * 1000)
}

/**
 * Parse cache control for max age header.
 *
 * @param  {string} cacheControl
 * @return {number}
 */
function parseMaxAge (cacheControl) {
  var ageMatch = /\bmax-age=(\d+)\b/i.exec(cacheControl)

  return ageMatch ? parseInt(ageMatch[1], 10) : 0
}

/**
 * Get case-insensitive property from object.
 *
 * @param  {Object} obj
 * @param  {string} property
 * @return {*}
 */
function getProperty (obj, property) {
  var keys = Object.keys(obj)

  for (var i = 0; i < keys.length; i++) {
    if (keys[i].toLowerCase() === property) {
      return obj[keys[i]]
    }
  }
}

/**
 * Check if a request can be cached.
 *
 * @param  {Object}  request
 * @param  {number}  now
 * @return {boolean}
 */
function isCacheableResponse (response, now) {
  // Ignore invalid responses.
  if (isStream(response.body) || response.statusType() !== 2) {
    return false
  }

  // Check whether the body is cacheable, according to headers we use.
  if (isCacheableMethod(response.request.method)) {
    return isFresh(response.headers, now) ||
      !!response.get('Last-Modified') ||
      !!response.get('ETag')
  }

  return false
}

/**
 * Convert a url into a cache-able path.
 *
 * @param  {string}
 * @return {string}
 */
function escapeFileKey (key) {
  return encodeURIComponent(key).replace(/%/g, '_')
}

/**
 * Create an empty stream instance for compatibility.
 *
 * @return {Object}
 */
function emptyStream () {
  var p = stream.PassThrough()
  p.end()
  return p
}

/**
 * Create a new "Not Modified" response every time to avoid listener memory
 * leak on the empty body stream.
 *
 * @return {Object}
 */
function notModified () {
  return {
    status: 304,
    body: emptyStream(),
    headers: {}
  }
}

/**
 * Check if the method is cacheable.
 *
 * @param  {string}
 * @return {boolean}
 */
function isCacheableMethod (method) {
  return method === 'GET' || method === 'HEAD'
}

/**
 * Length of a string.
 *
 * @param  {string} n
 * @return {number}
 */
function length (n) {
  return n.length
}

/**
 * Handle ENOENT promise errors.
 *
 * @param  {Error}   error
 * @return {Promise}
 */
function enoent (error) {
  return error.code === 'ENOENT' ? null : Promise.reject(error)
}

/**
 * In-memory and file store.
 */
function Store (options) {
  this.path = options.path
  this.fsQueue = {}
  this.fsCount = {}
}

/**
 * Handle race conditions by arbitrarily queuing requests.
 *
 * @param  {string}  key
 * @return {Promise}
 */
Store.prototype.queue = function (key, handle) {
  var fsQueue = this.fsQueue
  var fsCount = this.fsCount
  var queue = fsQueue[key]
  var path = this.getPath(key)

  // Increment the current queue count.
  fsCount[key] = (fsCount[key] + 1) || 1

  // Remove the key from the queue when done.
  function remove () {
    fsCount[key]--

    // Remove from queue when emptied.
    if (fsCount[key] === 0) {
      delete fsQueue[key]
      delete fsCount[key]
    }
  }

  if (!queue) {
    queue = Promise.resolve(handle(path))
  } else {
    queue = queue.then(function () { return handle(path) })
  }

  // Remove from the queue after execution.
  fsQueue[key] = queue.then(remove, remove)

  // Return the current promise executing.
  return queue
}

/**
 * Get the path to storage.
 *
 * @param  {string} key
 * @return {string}
 */
Store.prototype.getPath = function (key) {
  return join(this.path, escapeFileKey(key))
}

/**
 * Get data from the filesystem, or memory cache.
 *
 * @param  {string}  key
 * @return {Promise}
 */
Store.prototype.get = function (key) {
  return this.queue(key, function (path) {
    return readFile(path, 'utf8').then(JSON.parse).catch(enoent)
  })
}

/**
 * Set data into the filesystem and memory cache.
 *
 * @param {string}  key
 * @param {*}       value
 * @param {Promise}
 */
Store.prototype.set = function (key, value) {
  return this.queue(key, function (path) {
    return mkdirp(dirname(path))
      .then(function () {
        return writeFile(path, JSON.stringify(value))
      })
  })
}

/**
 * Delete a value from the store.
 *
 * @param  {string}  key
 * @return {Promise}
 */
Store.prototype.del = function (key) {
  return this.queue(key, function (path) {
    return unlink(path).catch(enoent)
  })
}
