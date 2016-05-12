var test = require('blue-tape')
var popsicle = require('popsicle')
var nock = require('nock')
var rimraf = require('rimraf')
var Promise = require('native-or-bluebird')
var cache = require('../')

test('popsicle cache', function (t) {
  t.test('before', function (t) {
    rimraf.sync(cache.TMP_PATH)

    t.end()
  })

  t.test('uncacheable', function (t) {
    t.test('before', function (t) {
      var date = new Date()
      date.setFullYear(date.getFullYear() + 1)

      nock('http://example.com')
        .get('/no')
        .reply(200, 'success', {
          'ETag': '123'
        })

      nock('http://example.com')
        .get('/no')
        .reply(404)

      nock('http://example.com')
        .post('/no')
        .reply(201)

      t.end()
    })

    t.test('make fresh http call', function (t) {
      return popsicle('http://example.com/no')
        .then(function (res) {
          t.equal(res.body, 'success')
        })
    })

    t.test('second call is not cached', function (t) {
      return popsicle('http://example.com/no')
        .use(cache())
        .then(function (res) {
          t.equal(res.status, 404)
        })
    })

    t.test('non-cached method', function (t) {
      return popsicle.post('http://example.com/no')
        .use(cache())
        .then(function (res) {
          t.equal(res.status, 201)
        })
    })
  })

  t.test('expires header', function (t) {
    t.test('before', function (t) {
      var date = new Date()
      date.setFullYear(date.getFullYear() + 1)

      nock('http://example.com')
        .get('/expires')
        .reply(200, '{"success":true}', {
          'Content-Type': 'application/json',
          'Expires': date.toGMTString()
        })

      t.end()
    })

    t.test('make fresh http call', function (t) {
      return popsicle('http://example.com/expires')
        .use(cache())
        .then(function (res) {
          t.deepEqual(res.body, { success: true })
        })
    })

    t.test('second call is cached', function (t) {
      return popsicle('http://example.com/expires')
        .use(cache())
        .then(function (res) {
          t.deepEqual(res.body, { success: true })
        })
    })
  })

  t.test('cache control header', function (t) {
    t.test('before', function (t) {
      nock('http://example.com')
        .get('/cache-control')
        .reply(200, '{"success":true}', {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300'
        })

      t.end()
    })

    t.test('make fresh http call', function (t) {
      return popsicle('http://example.com/cache-control')
        .use(cache())
        .then(function (res) {
          t.deepEqual(res.body, { success: true })
        })
    })

    t.test('second call is cached', function (t) {
      return popsicle('http://example.com/cache-control')
        .use(cache())
        .then(function (res) {
          t.deepEqual(res.body, { success: true })
        })
    })
  })

  t.test('last modified', function (t) {
    t.test('before', function (t) {
      var date = new Date()
      date.setFullYear(date.getFullYear() + 1)

      nock('http://example.com')
        .get('/modified')
        .reply(200, '{"success":true}', {
          'Content-Type': 'application/json',
          'Last-Modified': date.toGMTString()
        })

      nock('http://example.com', {
        'If-Modified-Since': date.toGMTString()
      })
        .get('/modified')
        .reply(304)

      t.end()
    })

    t.test('make fresh http call', function (t) {
      return popsicle('http://example.com/modified')
        .use(cache())
        .then(function (res) {
          t.deepEqual(res.body, { success: true })
        })
    })

    t.test('second call uses server response to look up cached', function (t) {
      return popsicle('http://example.com/modified')
        .use(cache())
        .then(function (res) {
          t.deepEqual(res.body, { success: true })
        })
    })
  })

  t.test('etag', function (t) {
    t.test('before', function (t) {
      var etag = '123abc'

      nock('http://example.com')
        .get('/etag')
        .reply(200, '{"success":true}', {
          'Content-Type': 'application/json',
          'ETag': etag
        })

      nock('http://example.com', {
        'If-None-Match': etag
      })
        .get('/etag')
        .reply(304)

      t.end()
    })

    t.test('make fresh http call', function (t) {
      return popsicle('http://example.com/etag')
        .use(cache())
        .then(function (res) {
          t.deepEqual(res.body, { success: true })
        })
    })

    t.test('second call uses server response to look up cached', function (t) {
      return popsicle('http://example.com/etag')
        .use(cache())
        .then(function (res) {
          t.deepEqual(res.body, { success: true })
        })
    })
  })

  t.test('unavailable', function (t) {
    t.test('before', function (t) {
      var etag = '123abc'

      nock('http://example.com')
        .get('/unavailable')
        .reply(200, '{"success":true}', {
          'Content-Type': 'application/json',
          'ETag': etag
        })

      t.end()
    })

    t.test('make fresh http call', function (t) {
      return popsicle('http://example.com/unavailable')
        .use(cache())
        .then(function (res) {
          t.deepEqual(res.body, { success: true })
        })
    })

    t.test('second call uses stale data for response', function (t) {
      return popsicle('http://example.com/unavailable')
        .use(cache())
        .then(function (res) {
          t.deepEqual(res.body, { success: true })
        })
    })
  })

  t.test('file race condition', function (t) {
    t.test('before', function (t) {
      var etag = Math.random().toString().substr(2)
      var headers = { Etag: etag }

      nock('http://example.com')
        .get('/')
        .reply(200, 'first response', headers)

      nock('http://example.com')
        .get('/')
        .reply(200, 'this is a different length', headers)

      nock('http://example.com')
        .get('/')
        .reply(200, 'another different length', headers)

      nock('http://example.com')
        .get('/')
        .reply(200, 'final response', headers)

      t.end()
    })

    t.test('multiple read file', function (t) {
      var cached = cache()

      return Promise.all([
        popsicle('http://example.com').use(cached),
        popsicle('http://example.com').use(cached),
        popsicle('http://example.com').use(cached)
      ])
        .then(function () {
          return popsicle('http://example.com').use(cached)
        })
    })
  })

  t.test('nock run all mocks', function (t) {
    t.equal(nock.pendingMocks().length, 0, 'Nock has pending mocks')
    t.end()
  })
})
