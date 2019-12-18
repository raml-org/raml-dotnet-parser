using System.Collections.Generic;

namespace RAML.Parser.Model
{
    public class Settings
    {
        public Settings(string requestTokenUri, string authorizationUri, string tokenCredentialsUri, IEnumerable<string> signatures, string accessTokenUri,
            IEnumerable<string> authorizationGrants, IEnumerable<Flow> flows, IEnumerable<Scope> scopes, string name, string @in)
        {
            RequestTokenUri = requestTokenUri;
            AuthorizationUri = authorizationUri;
            TokenCredentialsUri = tokenCredentialsUri;
            Signatures = signatures;
            AccessTokenUri = accessTokenUri;
            AuthorizationGrants = authorizationGrants;
            Flows = flows;
            Scopes = scopes;
            Name = name;
            In = @in;
        }

        public string RequestTokenUri { get; }
        public string AuthorizationUri { get; }
        public string TokenCredentialsUri { get; }
        public IEnumerable<string> Signatures { get; }
        public string AccessTokenUri { get; }
        public IEnumerable<string> AuthorizationGrants { get; }
        public IEnumerable<Flow> Flows { get; }
        public IEnumerable<Scope> Scopes { get; }
        public string Name { get; }
        public string In { get; }
    }
}