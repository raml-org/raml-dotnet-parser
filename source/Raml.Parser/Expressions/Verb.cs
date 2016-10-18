using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Builders;

namespace Raml.Parser.Expressions
{
	public class Verb
	{
		private readonly IDictionary<string, object> dynamicRaml;
		private readonly VerbType type;
	    private readonly string defaultMediaType;
	    private readonly bool isOptional;

		public Verb(IDictionary<string, object> dynamicRaml, VerbType type, string defaultMediaType, bool isOptional = false)
		{
			this.dynamicRaml = dynamicRaml;
			this.type = type;
		    this.defaultMediaType = defaultMediaType;
		    this.isOptional = isOptional;

            if (dynamicRaml == null)
			    return;
            
            Headers = GetHeaders();
            Responses = GetResponses();
            Body = GetBody();
            Description = GetDescription();
            QueryParameters = GetQueryParameters();
            UriParameters = ParametersBuilder.GetUriParameters(dynamicRaml, "uriParameters");
		}

	    public VerbType Type { get { return type; } }

		public bool IsOptional { get { return isOptional; } }

		public string Description { get; set; }

	    public IDictionary<string,Parameter> Headers { get; set; }

	    public IEnumerable<Response> Responses { get; set; }

	    public MimeType Body { get; set; }

        public IDictionary<string, Parameter> UriParameters { get; set; }

        public IDictionary<string, Parameter> QueryParameters { get; set; }

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
	            return new BodyBuilder((IDictionary<string, object>) mimeType.First()).GetMimeType(mimeType);
	        }
	        var body = dynamicRaml["body"] as IDictionary<string, object>;

	        return new BodyBuilder(body).GetMimeType(body);
	    }

        private IDictionary<string, Parameter> GetQueryParameters()
        {
            return dynamicRaml.ContainsKey("queryParameters")
                ? new ParametersBuilder((IDictionary<string, object>)dynamicRaml["queryParameters"]).GetAsDictionary()
                : null;
        }
	}
}