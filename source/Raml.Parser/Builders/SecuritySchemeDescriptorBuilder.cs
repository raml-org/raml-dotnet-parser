using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
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
            {
                var objects = dynamicRaml["responses"] as object[];
                if (objects != null)
                {
                    var responsesNest = objects.ToList().Cast<ExpandoObject>();
                    var responses = responsesNest.ToDictionary(
                        k => ((IDictionary<string, object>) k)["code"].ToString(), v => (object) v);
                    descriptor.Responses = new ResponsesBuilder(responses).GetAsDictionary(defaultMediaType);
                }
                else
                {
                    descriptor.Responses = new ResponsesBuilder((IDictionary<string, object>)dynamicRaml["responses"]).GetAsDictionary(defaultMediaType);                    
                }
            }
			return descriptor;
		}
	}
}