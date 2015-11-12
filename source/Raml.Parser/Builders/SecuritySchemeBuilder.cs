using System.Collections.Generic;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class SecuritySchemeBuilder
	{
		public SecurityScheme Build(IDictionary<string, object> dynamicRaml)
		{
			var securityScheme = new SecurityScheme();

			new BasicInfoBuilder().Set(dynamicRaml, securityScheme);

			securityScheme.DescribedBy = dynamicRaml.ContainsKey("describedBy")
				? new SecuritySchemeDescriptorBuilder().Build((IDictionary<string, object>) dynamicRaml["describedBy"])
				: null;

			securityScheme.Settings = dynamicRaml.ContainsKey("settings")
				? new SecuritySettingsBuilder().Build((IDictionary<string, object>) dynamicRaml["settings"])
				: null;

			return securityScheme;
		}
	}
}