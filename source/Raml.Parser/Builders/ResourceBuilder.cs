using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class ResourceBuilder
	{
	    private static readonly string[] Methods = { "get", "post", "put", "delete", "patch", "options"};

	    public Resource Build(IDictionary<string, object> dynamicRaml, IEnumerable<IDictionary<string, ResourceType>> resourceTypes, 
            IEnumerable<IDictionary<string, Method>> traits, string defaultMediaType)
		{
            var resource = new Resource();

			new BasicInfoBuilder().Set(dynamicRaml, resource);

			resource.RelativeUri = dynamicRaml.ContainsKey("relativeUri") ? (string) dynamicRaml["relativeUri"] : null;
			resource.BaseUriParameters = ParametersBuilder.GetUriParameters(dynamicRaml, "baseUriParameters");
			resource.UriParameters = ParametersBuilder.GetUriParameters(dynamicRaml, "uriParameters");
			resource.DisplayName = dynamicRaml.ContainsKey("displayName") ? (string) dynamicRaml["displayName"] : null;
			resource.Protocols = ProtocolsBuilder.Get(dynamicRaml);
			resource.Resources = GetResources(dynamicRaml, resourceTypes, traits, defaultMediaType);

            resource.Methods = GetMethods(dynamicRaml, traits, defaultMediaType);

            resource.Annotations = AnnotationsBuilder.GetAnnotations(dynamicRaml);
            resource.Is = IsExtractor.Get(dynamicRaml);

	        return resource;
		}





        private static IEnumerable<Method> GetMethods(IDictionary<string, object> dynamicRaml, IEnumerable<IDictionary<string, Method>> traits, string defaultMediaType)
	    {
            var methods = new Collection<Method>();
            if (!dynamicRaml.ContainsKey("methods"))
                return methods;

            var dynamicMethods = dynamicRaml["methods"] as object[];
            foreach (var dynamicMethod in dynamicMethods)
	        {
	            Method method = new Method();

                var dictionary = dynamicMethod as IDictionary<string, object>;
                if(dictionary != null)
	                method = new MethodBuilder().Build(dictionary, defaultMediaType);

	            methods.Add(method);
	        }
	        return methods;
	    }

	    private ICollection<Resource> GetResources(IDictionary<string, object> dynamicRaml, IEnumerable<IDictionary<string, ResourceType>> resourceTypes,
            IEnumerable<IDictionary<string, Method>> traits, string defaultMediaType)
		{
            var resources = new Collection<Resource>();
  	        if (!dynamicRaml.ContainsKey("resources"))
	            return resources;

	        var dynamicResources = dynamicRaml["resources"] as object[];

            foreach (var res in dynamicResources)
            {
                var dynamicRes = res as IDictionary<string, object>;
                var resource = new ResourceBuilder().Build(dynamicRes, resourceTypes, traits, defaultMediaType);
                resources.Add(resource);
            }

            return resources;

		}
	}
}