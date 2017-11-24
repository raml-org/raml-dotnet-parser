using System;
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

            if (!string.IsNullOrWhiteSpace(defaultMediaType) && dynamicRaml.ContainsKey(defaultMediaType))
            {
                var dynamicMimeType = dynamicRaml[defaultMediaType] as IDictionary<string, object>;
                if(dynamicMimeType != null && dynamicMimeType.Any(k => bodyKeys.Contains(k.Key)))
                    return new Dictionary<string, MimeType> { { defaultMediaType, GetMimeType(dynamicMimeType) } };
		    }

            if (!string.IsNullOrWhiteSpace(defaultMediaType) && dynamicRaml.Any(k => bodyKeys.Contains(k.Key)))
            {
                return new Dictionary<string, MimeType> { { defaultMediaType, GetMimeType(dynamicRaml) } };
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

		    RamlType ramlType = null;
            if (value.ContainsKey("type") && value.ContainsKey("properties"))
		    {
                ramlType = TypeBuilder.GetRamlType(new KeyValuePair<string, object>("obj", mimeType));
		    }

		    if (value.ContainsKey("application/json"))
		        value = value["application/json"] as IDictionary<string, object>;

            if (value.ContainsKey("type") && (value["type"] as IDictionary<string, object>) != null
                && ((IDictionary<string, object>)value["type"]).ContainsKey("properties"))
            {
                ramlType = TypeBuilder.GetRamlType(new KeyValuePair<string, object>("obj", value["type"]));
            }

            return new MimeType
			       {
                       Type = TypeExtractor.GetType(value),
                       InlineType = ramlType,
				       Description = value.ContainsKey("description") ? (string) value["description"] : null,
				       Example = DynamicRamlParser.GetExample(value),
				       Schema = GetSchema(value),
				       FormParameters = value.ContainsKey("formParameters")
					       ? GetParameters((IDictionary<string, object>) value["formParameters"])
					       : null,
                       Annotations = AnnotationsBuilder.GetAnnotations(dynamicRaml)
			       };
		}

	    private static string GetSchema(IDictionary<string, object> value)
	    {
	        if (!value.ContainsKey("schema"))
	            return null;

	        var schema = value["schema"] as object[];

	        if (schema != null && schema.Any())
	        {
                if (schema.Length == 1 && (string)schema.First() == "array" &&
	                value.ContainsKey("items"))
	            {
	                var itemsString = value["items"] as string;
                    if (itemsString != null)
                        return itemsString + "[]";

	                var asDictionary = value["items"] as IDictionary<string, object>;
	                if (asDictionary != null)
	                    return asDictionary.First() + "[]";
	            }
                
	            return (string) schema[0];
	        }


	        var asString = value["schema"] as string;
	        return asString;
	    }

	    private IDictionary<string, Parameter> GetParameters(IDictionary<string, object> dictionary)
        {
            if (dynamicRaml == null)
                return new Dictionary<string, Parameter>();

            return dictionary.ToDictionary(kv => kv.Key, kv => (new ParameterBuilder()).Build((IDictionary<string, object>)kv.Value));
        }
	}
}