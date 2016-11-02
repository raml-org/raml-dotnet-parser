using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
    public class VerbBuilder
    {
        private IDictionary<string, object> dynamicRaml;
        private string defaultMediaType;

        public Verb Build(IDictionary<string, object> dynamicRaml, VerbType type, string defaultMediaType, bool isOptional = false)
        {
            if (dynamicRaml == null)
                return null;

            this.dynamicRaml = dynamicRaml;
            this.defaultMediaType = defaultMediaType;

            var verb = new Verb
            {
                Type = type,
                IsOptional = isOptional,
                Headers = GetHeaders(),
                Responses = GetResponses(),
                Body = GetBody(),
                Description = GetDescription(),
                QueryParameters = GetQueryParameters()
            };
            return verb;
        }

        private string GetDescription()
        {
            return dynamicRaml.ContainsKey("description") ? (string)dynamicRaml["description"] : null;
        }

        private IDictionary<string, Parameter> GetHeaders()
        {
            return dynamicRaml.ContainsKey("headers")
                ? new ParametersBuilder(dynamicRaml["headers"] as IDictionary<string, object>).GetAsDictionary()
                : new Dictionary<string, Parameter>();
        }

        private IEnumerable<Response> GetResponses()
        {
            return dynamicRaml != null && dynamicRaml.ContainsKey("responses")
                ? new ResponsesBuilder(dynamicRaml["responses"] as IDictionary<string, object>).Get(defaultMediaType)
                : new List<Response>();
        }

        private MimeType GetBody()
        {
            if (!dynamicRaml.ContainsKey("body"))
                return null;

            var mimeType = dynamicRaml["body"] as object[];
            if (mimeType != null && mimeType.Any())
            {
                return new BodyBuilder((IDictionary<string, object>)mimeType.First()).GetMimeType(mimeType);
            }
            var body = dynamicRaml["body"] as IDictionary<string, object>;

            return new BodyBuilder(body).GetMimeType(body);
        }

        private IDictionary<string, Parameter> GetQueryParameters()
        {
            return dynamicRaml.ContainsKey("queryParameters")
                ? new ParametersBuilder((IDictionary<string, object>)dynamicRaml["queryParameters"]).GetAsDictionary()
                : new Dictionary<string, Parameter>();
        }
    }
}