using System.Collections.Generic;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class SecuritySchemeDescriptorBuilder
	{
        public SecuritySchemeDescriptor Build(IDictionary<string, object> dynamicRaml, string defaultMediaType)
		{
			var descriptor = new SecuritySchemeDescriptor();
			
			if (dynamicRaml.ContainsKey("headers"))
				descriptor.Headers = new ParametersBuilder((IDictionary<string, object>)dynamicRaml["headers"]).GetAsDictionary();

			if (dynamicRaml.ContainsKey("queryParameters"))
				descriptor.QueryParameters = new ParametersBuilder((IDictionary<string, object>)dynamicRaml["queryParameters"]).GetAsDictionary();

			if (dynamicRaml.ContainsKey("responses"))
                descriptor.Responses = new ResponsesBuilder((IDictionary<string, object>)dynamicRaml["responses"]).GetAsDictionary(defaultMediaType);

			return descriptor;
		}
	}
}