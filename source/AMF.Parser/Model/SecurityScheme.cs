using System.Collections.Generic;

namespace AMF.Parser.Model
{
    public class SecurityScheme
    {
        public SecurityScheme(string name, string type, string displayName, string description, IEnumerable<Parameter> headers, 
            IEnumerable<Parameter> queryParameters, IEnumerable<Response> responses, Settings settings, Shape queryString)
        {
            Name = name;
            Type = type;
            DisplayName = displayName;
            Description = description;
            Headers = headers;
            QueryParameters = queryParameters;
            Responses = responses;
            Settings = settings;
            QueryString = queryString;
        }

        public string Name { get; }
        public string Type { get; }
        public string DisplayName { get; }
        public string Description { get; }
        public IEnumerable<Parameter> Headers { get; }
        public IEnumerable<Parameter> QueryParameters { get; }
        public IEnumerable<Response> Responses { get; }
        public Settings Settings { get; }
        public Shape QueryString { get; }
    }
}