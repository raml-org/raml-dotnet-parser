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
					         Body = value.ContainsKey("body")
							         ? new BodyBuilder(value["body"] as IDictionary<string, object>).GetAsDictionary(defaultMediaType)
							         : null,
							 Headers = value.ContainsKey("headers")
										? new ParametersBuilder(value["headers"] as IDictionary<string, object>).GetAsDictionary()
										: new Dictionary<string, Parameter>(),
                            Annotations = AnnotationsBuilder.GetAnnotations(value)
				         });
			}
			return list;
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