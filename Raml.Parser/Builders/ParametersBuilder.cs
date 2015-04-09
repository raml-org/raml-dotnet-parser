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

		public IEnumerable<Parameter> Get()
		{
		    if (dynamicRaml == null)
		        return new List<Parameter>();

			return (dynamicRaml.Where(pair => pair.Value != null)
				.Select(pair => (new ParameterBuilder()).Build((IDictionary<string, object>) pair.Value)))
				.ToList();
		}

		public IDictionary<string, Parameter> GetAsDictionary()
		{
            if (dynamicRaml == null)
                return new Dictionary<string, Parameter>();

			return dynamicRaml.ToDictionary(kv => kv.Key, kv => (new ParameterBuilder()).Build((IDictionary<string, object>) kv.Value));
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