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
	            var path = GetPath(filePath);
	            var raml = await LoadRamlAsync(content, path);

                return raml;
            }
        }

	    private static string GetPath(string filePath)
	    {
		    var path = Path.GetDirectoryName(filePath);
		    if (string.IsNullOrWhiteSpace(path) || path.StartsWith("http")) 
				return path;

		    path = path.Substring(2);
		    if (!path.EndsWith("\\"))
			    path += "\\";
		    
			return path;
	    }

	    public async Task<RamlDocument> LoadRamlAsync(string raml, string path)
		{
            if (string.IsNullOrWhiteSpace(raml))
                throw new ArgumentException("raml");

			var load = Edge.Func(@"
                return function (ramlConf, callback) {
                    var raml = require('raml-parser');
                    raml.load(ramlConf.Content, ramlConf.Path).then( function(parsed) {
                        callback(null, parsed);
                    }, function(error) {
                        callback(null, 'Error parsing: ' + error);
                    });
                }
            ");

			var rawresult = await load(new { Content = raml, Path = path });
			var error = rawresult as string;
			if (!string.IsNullOrWhiteSpace(error) && error.ToLowerInvariant().Contains("error"))
				throw new FormatException(error);

			var ramlDocument = new RamlBuilder().Build((IDictionary<string, object>)rawresult);
			
			return ramlDocument;
		}
    }
}
