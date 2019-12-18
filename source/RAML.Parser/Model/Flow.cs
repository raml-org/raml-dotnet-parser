using System.Collections.Generic;

namespace RAML.Parser.Model
{
    public class Flow
    {
        public Flow(string authorizationUri, string accessTokenUri, string flow, IEnumerable<Scope> scopes)
        {
            AuthorizationUri = authorizationUri;
            AccessTokenUri = accessTokenUri;
            FlowValue = flow;
            Scopes = scopes;
        }

        public string AuthorizationUri { get; }
        public string AccessTokenUri { get; }
        public string FlowValue { get; }
        public IEnumerable<Scope> Scopes { get; }
    }
}