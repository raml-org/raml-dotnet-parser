using System;
using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class ProtocolsBuilder
	{
		public static IEnumerable<Protocol> Get(IDictionary<string, object> dynamicRaml)
		{
			object value;
			var protocols = new Protocol[0];
			if (dynamicRaml.TryGetValue("protocols", out value))
			{
				protocols = ((object[])value).Select(v => (Protocol)Enum.Parse(typeof(Protocol), (string)v)).ToArray();
			}

			return protocols;
		} 
	}
}