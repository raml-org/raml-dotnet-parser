using System.Collections.Generic;

namespace AMF.Parser.Model
{
    public class Operation
    {
        public Operation(string method, string name, string description, bool deprecated, string summary, Documentation documentation, 
            IEnumerable<string> schemes, IEnumerable<string> accepts, IEnumerable<string> contentType, Request request, IEnumerable<Response> responses, 
            IEnumerable<SecurityScheme> security)
        {
            Method = method;
            Name = name;
            Description = description;
            Deprecated = deprecated;
            Summary = summary;
            Documentation = documentation;
            Schemes = schemes;
            Accepts = accepts;
            ContentType = contentType;
            Request = request;
            Responses = responses;
            Security = security;
        }

        public string Method { get; }
        public string Name { get; }
        public string Description { get; }
        public bool Deprecated { get; }
        public string Summary { get; }
        public Documentation Documentation { get; }
        public IEnumerable<string> Schemes { get; }
        public IEnumerable<string> Accepts { get; }
        public IEnumerable<string> ContentType { get; }
        public Request Request { get; }
        public IEnumerable<Response> Responses { get; }
        public IEnumerable<SecurityScheme> Security { get; }
    }
}