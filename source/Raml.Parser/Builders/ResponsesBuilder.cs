using System;
using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class ResponsesBuilder
	{
		private readonly IDictionary<string, object> dynamicRaml;

		public ResponsesBuilder(IDictionary<string, object> dynamicRaml)
		{
			this.dynamicRaml = dynamicRaml;
		}

        public IEnumerable<Response> Get(string defaultMediaType)
		{
			var list = new List<Response>();

			if (dynamicRaml == null)
				return list;

			
			foreach (var pair in dynamicRaml)
			{
				var value = pair.Value as IDictionary<string, object>;
				if(value == null)
					continue;

				list.Add(new Response
				         {
					         Code = pair.Key,
					         Description = value.ContainsKey("description") ? value["description"] as string : null,
					         Body = GetBody(defaultMediaType, value),
							 Headers = GetHeaders(value),
                            Annotations = AnnotationsBuilder.GetAnnotations(value)
				         });
			}
			return list;
		}

	    private static IDictionary<string, Parameter> GetHeaders(IDictionary<string, object> value)
	    {
	        if (!value.ContainsKey("headers"))
	            return new Dictionary<string, Parameter>();

	        var asDictionary = value["headers"] as IDictionary<string, object>;
            if(asDictionary != null)
	            return new ParametersBuilder(asDictionary).GetAsDictionary();

	        var asObjArray = value["headers"] as object[];
	        if (asObjArray != null)
                return GetObjectArrayHeaders(asObjArray);

	        throw new InvalidOperationException("Unable to parse headers");
	    }

	    private static IDictionary<string, Parameter> GetObjectArrayHeaders(IEnumerable<object> asObjArray)
	    {
	        var headers = new Dictionary<string, Parameter>();
            foreach (IDictionary<string, object> header in asObjArray)
	        {
	            var param = new ParameterBuilder().Build(header);
	            var key = header["name"] as string;
	            if (key != null)
	                headers.Add(key, param);
	        }
	        return headers;
	    }

	    private static IDictionary<string, MimeType> GetBody(string defaultMediaType, IDictionary<string, object> value)
	    {
	        if (!value.ContainsKey("body"))
	            return null;

            var objArr = value["body"] as object[];
            if(objArr != null)
                return new BodyBuilder((IDictionary<string, object>) objArr.First()).GetAsDictionary(defaultMediaType);

	        var dictionary = value["body"] as IDictionary<string, object>;
	        return new BodyBuilder(dictionary).GetAsDictionary(defaultMediaType);
	    }

	    public IDictionary<string, Response> GetAsDictionary(string defaultMediaType)
		{
            if(dynamicRaml == null)
                return new Dictionary<string, Response>();

			return dynamicRaml
				.ToDictionary(kv => kv.Key,
					kv =>
					{
						var value = (IDictionary<string, object>) kv.Value;
						return new Response
						       {
							       Code = kv.Key,
							       Description =
								       value.ContainsKey("description")
									       ? value["description"] as string
									       : null,
							       Body =
								       value.ContainsKey("body")
									       ? new BodyBuilder(
                                       value["body"] as IDictionary<string, object>).GetAsDictionary(defaultMediaType)
									       : null
						       };
					});
		}
	}
}