using System.Collections.Generic;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class BasicInfoBuilder
	{
		public BasicInfo Build(IDictionary<string, object> dynamicRaml)
		{
			var basicInfo = new BasicInfo();
			basicInfo.Type = GetType(dynamicRaml);
			basicInfo.Description = dynamicRaml.ContainsKey("description") ? (string)dynamicRaml["description"] : null;
			return basicInfo;
		}

		public void Set(IDictionary<string, object> dynamicRaml, BasicInfo basicInfo)
		{
			basicInfo.Type = GetType(dynamicRaml);
			basicInfo.Description = dynamicRaml.ContainsKey("description") ? (string)dynamicRaml["description"] : null;
		}

		public IDictionary<string, IDictionary<string, string>> GetType(IDictionary<string, object> dynamicRaml)
		{
			var ret = new Dictionary<string, IDictionary<string, string>>();
			if (!dynamicRaml.ContainsKey("type"))
				return ret;

			var asString = dynamicRaml["type"] as string;
			if (asString != null)
			{
				ret.Add(asString, null);
				return ret;
			}

			var types = dynamicRaml["type"] as IDictionary<string, object>;
			foreach (var type in types)
			{
				var val = new Dictionary<string, string>();
				var values = type.Value as IDictionary<string, object>;
				if (values != null)
				{
					foreach (var value in values)
					{
						val.Add(value.Key, value.Value as string);
					}
				}
				ret.Add(type.Key, val);
			}

			return ret;
		}
	}
}