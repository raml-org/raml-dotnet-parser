using System.Collections.Generic;
using Raml.Parser.Builders;

namespace Raml.Parser.Expressions
{
	public class Verb
	{
		private readonly IDictionary<string, object> dynamicRaml;
		private readonly VerbType type;
		private readonly bool isOptional;

		public Verb(IDictionary<string, object> dynamicRaml, VerbType type, bool isOptional = false)
		{
			this.dynamicRaml = dynamicRaml;
			this.type = type;
			this.isOptional = isOptional;
		}

		public VerbType Type { get { return type; } }

		public bool IsOptional { get { return isOptional; } }

		public string Description { get { return dynamicRaml.ContainsKey("description") ? (string)dynamicRaml["description"]: null; } }

		public IDictionary<string,Parameter> Headers
		{
			get
			{
				return dynamicRaml.ContainsKey("headers")
					? new ParametersBuilder(dynamicRaml["headers"] as IDictionary<string, object>).GetAsDictionary()
					: new Dictionary<string, Parameter>();
			}
		}

		public IEnumerable<Response> Responses
		{
			get
			{
				return dynamicRaml != null && dynamicRaml.ContainsKey("responses")
					? new ResponsesBuilder(dynamicRaml["responses"] as IDictionary<string, object>).Get()
					: new List<Response>();
			}
		}

		public MimeType Body
		{
			get
			{
				if (dynamicRaml == null)
					return null;

				return dynamicRaml.ContainsKey("body")
					? new BodyBuilder((IDictionary<string, object>) dynamicRaml["body"]).GetMimeType((IDictionary<string, object>) dynamicRaml["body"], string.Empty)
					: null;
			}
		}
	}
}