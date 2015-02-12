using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class ResourceBuilder
	{
		public Resource Build(IDictionary<string, object> dynamicRaml)
		{
			var resource = new Resource();

			new BasicInfoBuilder().Set(dynamicRaml, resource);

			resource.RelativeUri = dynamicRaml.ContainsKey("relativeUri") ? (string) dynamicRaml["relativeUri"] : null;
			resource.BaseUriParameters = ParametersBuilder.GetUriParameters(dynamicRaml, "baseUriParameters");
			resource.UriParameters = ParametersBuilder.GetUriParameters(dynamicRaml, "uriParameters");
			resource.DisplayName = dynamicRaml.ContainsKey("displayName") ? (string) dynamicRaml["displayName"] : null;
			resource.Protocols = ProtocolsBuilder.Get(dynamicRaml);
			resource.Resources = GetResources(dynamicRaml);

			resource.Methods = dynamicRaml.ContainsKey("methods")
				? new MethodsBuilder(((object[]) dynamicRaml["methods"]).Cast<IDictionary<string, object>>()).Get()
				: null;

			return resource;
		}

		private ICollection<Resource> GetResources(IDictionary<string, object> dynamicRaml)
		{
			object value;
			var resources = new Resource[0];
			if (dynamicRaml.TryGetValue("resources", out value))
				resources = ((object[])value).Select(o => new ResourceBuilder().Build((IDictionary<string, object>)o)).ToArray();

			return resources;
		}
	}
}