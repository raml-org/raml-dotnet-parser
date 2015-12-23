using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class BodyBuilder
	{
		private readonly IDictionary<string, object> dynamicRaml;
        private readonly string[] bodyKeys = { "type", "example", "schema", "formParameters", "description" };

	    public BodyBuilder(IDictionary<string, object> dynamicRaml)
		{
			this.dynamicRaml = dynamicRaml;
		}

		public IDictionary<string, MimeType> GetAsDictionary(string defaultMediaType)
		{
            if(dynamicRaml == null)
                return new Dictionary<string, MimeType>();

            if (!string.IsNullOrWhiteSpace(defaultMediaType) && dynamicRaml.Keys.Any(k => bodyKeys.Contains(k)))
		    {
		        return new Dictionary<string, MimeType> {{defaultMediaType, GetMimeType(dynamicRaml)}};
		    }

			return dynamicRaml.ToDictionary(kv => kv.Key, pair => GetMimeType(pair.Value));
		}

		public MimeType GetMimeType(object mimeType)
		{
            var value = mimeType as IDictionary<string, object>;
		    if (value == null)
		    {
		        var schema = mimeType as string;
                return !string.IsNullOrWhiteSpace(schema) ? new MimeType { Schema = schema } : null;
		    }

            if (value.ContainsKey("body") && value["body"] is IDictionary<string, object>)
				value = (IDictionary<string, object>) value["body"];

			return new MimeType
			       {
                       Type = value.ContainsKey("type") ? (string)value["type"] : null,
				       Description = value.ContainsKey("description") ? (string) value["description"] : null,
				       Example = value.ContainsKey("example") ? (string) value["example"] : null,
				       Schema = value.ContainsKey("schema") ? (string) value["schema"] : null,
				       FormParameters = value.ContainsKey("formParameters")
					       ? GetParameters((IDictionary<string, object>) value["formParameters"])
					       : null,
                       Annotations = AnnotationsBuilder.GetAnnotations(dynamicRaml)
			       };
		}

        private IDictionary<string, Parameter> GetParameters(IDictionary<string, object> dictionary)
        {
            if (dynamicRaml == null)
                return new Dictionary<string, Parameter>();

            return dictionary.ToDictionary(kv => kv.Key, kv => (new ParameterBuilder()).Build((IDictionary<string, object>)kv.Value));
        }
	}
}