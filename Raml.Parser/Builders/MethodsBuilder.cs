using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class MethodsBuilder
	{
		private readonly IEnumerable<IDictionary<string, object>> dynamicRaml;

		public MethodsBuilder(IEnumerable<IDictionary<string, object>> dynamicRaml)
		{
			this.dynamicRaml = dynamicRaml;
		}

		public IEnumerable<Method> Get()
		{
			return dynamicRaml.Select(x => new MethodBuilder().Build(x)).ToList();
		}
	}
}