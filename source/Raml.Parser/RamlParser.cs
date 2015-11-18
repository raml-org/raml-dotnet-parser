using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EdgeJs;
using Raml.Parser.Builders;
using Raml.Parser.Expressions;
using System.IO;

namespace Raml.Parser
{
    public class RamlParser
    {
        public async Task<RamlDocument> LoadAsync(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("filePath");

            var load = Edge.Func(@"

                return function (path, callback) {

                    require('raml-1-0-parser');

                    var RAML = global.RAML;

                    var api = RAML.loadApi(path).getOrElse(null);

                    if(api == null)
                        callback(null, 'Error: ' + path + ' returned null');

                    if(api.errors() != null && api.errors().length > 0){

                        var errors = '';
                        for(var i = 0; i < api.errors().length; i++)
                            errors += api.errors()[i].message;

                        callback(null, 'Error: ' + errors);
                    }

                    callback(null, RAML.toJSON(api));
                }
            ");

            var rawresult = await load(filePath);
            var error = rawresult as string;
            if (!string.IsNullOrWhiteSpace(error) && error.ToLowerInvariant().Contains("error"))
                throw new FormatException(error);

            var ramlDocument = new RamlBuilder().Build((IDictionary<string, object>)rawresult);

            return ramlDocument;
        }
    }
}
