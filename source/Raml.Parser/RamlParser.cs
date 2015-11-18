using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EdgeJs;
using Raml.Parser.Builders;
using Raml.Parser.Expressions;
using System.IO;
using System.Net.Http;
using System.Web.Script.Serialization;

namespace Raml.Parser
{
    public class RamlParser
    {
        private static readonly string ParserServiceUrl;

        static RamlParser()
        {
            ParserServiceUrl = "http://localhost:1337/";
        }

        public async Task<RamlDocument> LoadAsync(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("filePath");

            var client = new HttpClient();
            var response = await client.GetAsync(ParserServiceUrl + "?path=" + filePath);
            var content = await response.Content.ReadAsStringAsync();

            if(content.StartsWith("Error:"))
                throw new FormatException(content);

            var serializer = new JavaScriptSerializer();
            var deserializedContent = (IDictionary<string, object>)serializer.Deserialize(content, typeof(IDictionary<string, object>));

            var builder = new RamlBuilder();
            var ramlDocument = builder.Build(deserializedContent);
            
            return ramlDocument;
        }
    }
}
