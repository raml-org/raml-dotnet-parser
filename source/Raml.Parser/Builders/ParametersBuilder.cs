using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class ParametersBuilder
	{
		private readonly IDictionary<string, object> dynamicRaml;

		public ParametersBuilder(IDictionary<string, object> dynamicRaml)
		{
			this.dynamicRaml = dynamicRaml;
		}

		public IDictionary<string, Parameter> GetAsDictionary()
		{
            if (dynamicRaml == null)
                return new Dictionary<string, Parameter>();

		    var dictionary = new Dictionary<string, Parameter>();
		    foreach (var keyValuePair in dynamicRaml)
		    {
                var value = keyValuePair.Value as IDictionary<string, object>;
                if(value != null)
		            dictionary.Add(keyValuePair.Key, (new ParameterBuilder()).Build(value));

		        var val = keyValuePair.Value as string;
		        if (val != null)
		            dictionary.Add(keyValuePair.Key, new Parameter {Type = "string"});
		    }
		    return dictionary;
		}

		public static IDictionary<string, Parameter> GetUriParameters(IDictionary<string, object> dynamicRaml, string name)
		{
            if (dynamicRaml == null)
                return new Dictionary<string, Parameter>();

			if (!dynamicRaml.ContainsKey(name))
				return new Dictionary<string, Parameter>();

			var uriParams = (IDictionary<string, object>)dynamicRaml[name];
			return uriParams
				.ToDictionary(param => param.Key, param =>
					(new ParameterBuilder()).Build((IDictionary<string, object>)param.Value));
		}
	}
}