using System.Collections.Generic;

namespace RAML.Parser.Model
{
    public class Request
    {
        public Request(IEnumerable<Parameter> queryParameters, IEnumerable<Parameter> headers, IEnumerable<Payload> payloads, Shape queryString)
        {
            QueryParameters = queryParameters;
            Headers = headers;
            Payloads = payloads;
            QueryString = queryString;
        }

        public IEnumerable<Parameter> QueryParameters { get; }
        public IEnumerable<Parameter> Headers { get; }
        public IEnumerable<Payload> Payloads { get; }
        public Shape QueryString { get; }
    }
}