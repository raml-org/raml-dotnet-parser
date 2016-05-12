var tsc = require('./index');

var r = tsc.compile('test/compiler.ts', '-w -m commonjs');

console.log(tsc.executeCommandLine);
