LRUCache v0.2.0 [![Build Status](https://travis-ci.org/zensh/lrucache.png?branch=master)](https://travis-ci.org/zensh/lrucache)
====
LRU Cache for node.js/browser.

使用链表实现的 LRU 缓存。`get`、`set` 和 `update` 方法会更新 LRU 优先级。

## Install

**Node.js:**

    npm install lrucache

**bower:**

    bower install lrucache

**Browser:**

    <script src="/pathTo/lrucache.js"></script>

## API

    var LRUCache = require('lrucache');

### LRUCache([capacity])

`LRUCache` 构造函数。

+ **capacity:** Number，可选，设置 LRUCache 的容量，未设置则为无限容量。

```js
var cache = LRUCache(100);
```

### LRUCache.prototype.get(key)

return `value`;

```js
var a = cache.get('a');
```

### LRUCache.prototype.set(key, value)

return `this`;

```js
cache.set('a', [1, 2, 3]);
```

### LRUCache.prototype.update(key, fn)

return `this`，如果缓存 `a` 不存在，则不会执行。

```js
cache.update('a', function (a) {
  a.push(4);
  return a;
});
```

### LRUCache.prototype.remove(key)

return `this`;

```js
cache.remove('a');
```

### LRUCache.prototype.removeAll(key)

return `this`;

```js
cache.removeAll();
```

### LRUCache.prototype.keys()

return a array of `keys`;

```
cache.keys();
```

### LRUCache.prototype.has(key)

return `true` or `false`;

```js
cache.has('a');
```

### LRUCache.prototype.staleKey()

return the stalest `key` or `null`;

```js
vat staleKey = cache.staleKey();
```

### LRUCache.prototype.popStale()

return the stalest `data` or `null`;

```js
var staleDate = cache.popStale();
```

### LRUCache.prototype.info()

return `info`;

```js
cache.info();
```
