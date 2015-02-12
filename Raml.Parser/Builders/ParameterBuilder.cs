using System;
using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class ParameterBuilder
	{
		public Parameter Build(IDictionary<string, object> dynamicRaml)
		{
			var parameter = new Parameter();
			parameter.Type = dynamicRaml.ContainsKey("type") ? (string) dynamicRaml["type"] : null;
			parameter.Required = dynamicRaml.ContainsKey("required") && (bool) dynamicRaml["required"];
			parameter.DisplayName = dynamicRaml.ContainsKey("displayName") ? (string) dynamicRaml["displayName"] : null;
			parameter.Description = dynamicRaml.ContainsKey("description") ? (string) dynamicRaml["description"] : null;
			parameter.Enum = GetEnum(dynamicRaml);
			parameter.Repeat = dynamicRaml.ContainsKey("repeat") && (bool) dynamicRaml["repeat"];
			parameter.Example = dynamicRaml.ContainsKey("example") ? dynamicRaml["example"].ToString() : null;
			parameter.Default = dynamicRaml.ContainsKey("default") ? (dynamicRaml["default"] != null ? dynamicRaml["default"].ToString() : null) : null;
			parameter.Pattern = dynamicRaml.ContainsKey("pattern") ? (string) dynamicRaml["pattern"] : null;
			parameter.MinLength = dynamicRaml.ContainsKey("minLength") ? Convert.ToInt32(dynamicRaml["default"]) : (int?) null;
			parameter.MaxLength = dynamicRaml.ContainsKey("maxLength") ? Convert.ToInt32(dynamicRaml["maxLength"]) : (int?) null;
			parameter.Minimum = dynamicRaml.ContainsKey("minimum") ? Convert.ToDecimal(dynamicRaml["minimum"]) : (decimal?) null;
			parameter.Maximum = dynamicRaml.ContainsKey("maximum") ? Convert.ToDecimal(dynamicRaml["maximum"]) : (decimal?) null;
			return parameter;
		}

		private static IEnumerable<string> GetEnum(IDictionary<string, object> dynamicRaml)
		{
			if (!dynamicRaml.ContainsKey("enum")) return null;

			var objects = ((object[]) dynamicRaml["enum"]);
			return objects.Select(obj => obj.ToString()).ToArray();
		}
	}
}