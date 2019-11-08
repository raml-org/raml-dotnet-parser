using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RAML.Parser.Model
{
    public class WebApi
    {
        public WebApi(string name, string description, string host, IEnumerable<string> schemes, IEnumerable<EndPoint> endPoints, IEnumerable<string> servers, IEnumerable<string> accepts, IEnumerable<string> contentType, string version, string termsOfService, Organization provider, License license, IEnumerable<Documentation> documentations, IEnumerable<Parameter> baseUriParameters, IEnumerable<ParametrizedSecurityScheme> security)
        {
            Name = name;
            Description = description;
            Host = host;
            Schemes = schemes;
            EndPoints = endPoints;
            Servers = servers;
            Accepts = accepts;
            ContentType = contentType;
            Version = version;
            TermsOfService = termsOfService;
            Provider = provider;
            License = license;
            Documentations = documentations;
            BaseUriParameters = baseUriParameters;
            Security = security;
        }

        public string Name { get; }
        public string Description { get; }
        public string Host { get; }
        public IEnumerable<string> Schemes { get; }
        public IEnumerable<EndPoint> EndPoints { get; }
        public IEnumerable<string> Servers { get; }
        public IEnumerable<string> Accepts { get; }
        public IEnumerable<string> ContentType { get; }
        public string Version { get; }
        public string TermsOfService { get; }
        public Organization Provider { get; }
        public License License { get; }
        public IEnumerable<Documentation> Documentations { get; }
        public IEnumerable<Parameter> BaseUriParameters { get; }
        public IEnumerable<ParametrizedSecurityScheme> Security { get; }
    }
}
