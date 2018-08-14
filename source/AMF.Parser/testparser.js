

var parser = require('parser');

console.log('Start');

// try {
//     var filepath = "file:///c:/desarrollo/mulesoft/amf-dotnet-parser/source/AMF.Parser.Tests/specs/included-files.raml"
//     parser.parse('raml08', filepath, function (m) {
//         console.log(m);
//     });
// }
// catch(ex){
//     console.log(ex);
// }



// try {
//     var filepath = "file:///Users/pedro/Downloads/american-flights-api-1.0.0-raml/american-flights-api.raml"
//     parser.parse('raml', filepath, function (m) {
//         console.log(m);
//     });
// }
// catch(ex){
//     console.log(ex);
// }


// try {
//     var filepath = "file:///c:/desarrollo/mulesoft/amf-dotnet-parser/source/AMF.Parser.Tests/specs/relative-include.raml"
//     parser.parse('raml', filepath, function (m) {
//         console.log(m);
//     });
// }
// catch(ex){
//     console.log(ex);
// }

try {
    var filepath = "file:///c:/desarrollo/mulesoft/amf-dotnet-parser/source/AMF.Parser.Tests/specs/movies-v1.raml"
    parser.parse('raml', filepath, function (m) {
        console.log(m);
    });
}
catch(ex){
    console.log(ex);
}

// try {
//     var filepath = "file:///c:/desarrollo/mulesoft/amf-dotnet-parser/source/AMF.Parser.Tests/specs/chinook-v1.raml"
//     parser.parse('raml', filepath, function (m) {
//         console.log(m);
//     });
// }
// catch(ex){
//     console.log(ex);
// }

// try {
//     var filepath = "file:///c:/desarrollo/mulesoft/amf-dotnet-parser/source/AMF.Parser.Tests/specs/resource-types.raml"
//     parser.parse('raml', filepath, function (m) {
//         console.log(m);
//     });
// }
// catch(ex){
//     console.log(ex);
// }

// try {
//     var filepath = "file:///c:/desarrollo/mulesoft/amf-dotnet-parser/source/AMF.Parser.Tests/specs/oas/yaml/petstore-with-external-docs.yaml"
//     parser.parse('raml', filepath, function (m) {
//         console.log(m);
//     });
// }
// catch(ex){
//     console.log(ex);
// }

// try {
//     var filepath = "file:///c:/desarrollo/mulesoft/amf-dotnet-parser/source/AMF.Parser.Tests/specs/lib-traits.raml"
//     parser.parse('raml', filepath, function (m) {
//         console.log(m);
//     });
// }
// catch(ex){
//     console.log(ex);
// }

// try {
//     var filepath = "file:///c:/desarrollo/mulesoft/amf-dotnet-parser/source/AMF.Parser.Tests/specs/oas/json/petstore.json"
//     parser.parse('raml', filepath, function (m) {
//         console.log(m);
//     });
// }
// catch(ex){
//     console.log(ex);
// }

// var filepath = "file:///c:/desarrollo/mulesoft/amf-dotnet-parser/source/AMF.Parser.Tests/specs/arrayTypes.raml"
// parser.parse('raml', filepath, function (m) {
//     console.log(m);
// });

// var filepath = "file:///c:/desarrollo/mulesoft/amf-dotnet-parser/source/AMF.Parser.Tests/specs/typeExpressions.raml"
// parser.parse('raml', filepath, function (m) {
//     console.log(m);
// });


// var filepath = "file:///c:/desarrollo/mulesoft/amf-dotnet-parser/source/AMF.Parser.Tests/specs/oas/yaml/api-with-examples.yaml"
// parser.parse('oas', filepath, function (m) {
//     console.log(m);
// });