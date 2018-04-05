using System.Collections.Generic;

namespace AMF.Parser.Model
{
    public class Settings
    {
        public Settings(string requestTokenUri, string authorizationUri, string tokenCredentialsUri, IEnumerable<string> signatures, string accessTokenUri, IEnumerable<string> authorizationGrants, string flow, IEnumerable<Scope> scopes, string name, string @in)
        {
            RequestTokenUri = requestTokenUri;
            AuthorizationUri = authorizationUri;
            TokenCredentialsUri = tokenCredentialsUri;
            Signatures = signatures;
            AccessTokenUri = accessTokenUri;
            AuthorizationGrants = authorizationGrants;
            Flow = flow;
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
        public string Flow { get; }
        public IEnumerable<Scope> Scopes { get; }
        public string Name { get; }
        public string In { get; }
    }
}