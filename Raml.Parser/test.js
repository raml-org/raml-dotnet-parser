var raml = require('raml-parser');

  raml.loadFile('\\desarrollo\\_raml\\Raml.Parser\\Raml.VisualStudio.Tools.Tests\\movies.raml','\\desarrollo\\_raml\\Raml.Parser\\Raml.VisualStudio.Tools.Tests\\')
  .then( function(data) {
    console.log(data);
  }, function(error) {
    console.log('Error parsing: ' + error);
  });