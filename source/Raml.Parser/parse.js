var apiFactory = require('raml-1-0-parser-fragment');
var raml = apiFactory.api("c:\\desarrollo\\mulesoft\\raml-1-files\\parameters.raml");
console.log(apiFactory.toJSON(raml))