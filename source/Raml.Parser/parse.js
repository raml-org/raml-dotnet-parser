
var path = "\\desarrollo\\mulesoft\\raml-dotnet-parser-2\\source\\Raml.Parser.Tester\\files\\congo-drones-5-f.raml";

require('raml-1-0-parser');

var RAML = global.RAML;

var api = RAML.loadApi(path).getOrElse(null);

if (api === null)
    console.log('Error: ' + path + ' returned null');

if (api.errors() != null && api.errors().length > 0) {

    var errors = '';
    for (var i = 0; i < api.errors().length; i++)
        errors += api.errors()[i].message;

    console.log('Error: ' + errors);
}

console.log(RAML.toJSON(api));
