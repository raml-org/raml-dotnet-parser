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
                throw new ArgumentException("path");

            using(var sr = new StreamReader(filePath))
            {
                var content = await sr.ReadToEndAsync();
	            var raml = await LoadRamlAsync(content);

                return raml;
            }
        }

	    public async Task<RamlDocument> LoadRamlAsync(string raml)
		{
            if (string.IsNullOrWhiteSpace(raml))
                throw new ArgumentException("raml");

			var load = Edge.Func(@"
                return function (content, callback) {
                    var raml = require('raml-parser');
                    raml.load(content).then( function(parsed) {
                        callback(null, parsed);
                    }, function(error) {
                        callback(null, 'Error parsing: ' + error);
                    });
                }
            ");

			var rawresult = await load(raml);
			var error = rawresult as string;
			if (!string.IsNullOrWhiteSpace(error) && error.ToLowerInvariant().Contains("error"))
				throw new FormatException(error);

			var ramlDocument = new RamlBuilder().Build((IDictionary<string, object>)rawresult);
			
			return ramlDocument;
		}
    }
}
