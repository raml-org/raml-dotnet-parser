using System.Collections.Generic;

namespace AMF.Parser.Model
{
    public class Response
    {
        public Response(string name, string description, string statusCode, IEnumerable<Parameter> headers, IEnumerable<Payload> payloads, IEnumerable<Example> examples)
        {
            Name = name;
            Description = description;
            StatusCode = statusCode;
            Headers = headers;
            Payloads = payloads;
            Examples = examples;
        }

        public string Name { get; }
        public string Description { get; }
        public string StatusCode { get; }
        public IEnumerable<Parameter> Headers { get; }
        public IEnumerable<Payload> Payloads { get; }
        public IEnumerable<Example> Examples { get; }
    }
}