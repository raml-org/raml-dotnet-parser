/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/chai/chai.d.ts" />
var chai = require('chai');
var expect = chai.expect;
var tsc = require('..');
describe('CompositeCompilerHost', function () {
    it('Should accept custom lib.d.ts locations', function () {
        var cch = new tsc.CompositeCompilerHost({ defaultLibFilename: 'some/random/lib.d.ts' });
        expect(cch.getDefaultLibFilename()).to.equal('some/random/lib.d.ts');
    });
});
