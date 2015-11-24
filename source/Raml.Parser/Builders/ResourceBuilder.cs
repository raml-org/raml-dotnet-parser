using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class ResourceBuilder
	{
	    private static readonly string[] Methods = { "get", "post", "put", "delete", "patch", "options"};

	    public Resource Build(IDictionary<string, object> parentDynamicRaml, string key, IEnumerable<IDictionary<string, ResourceType>> resourceTypes, 
            IEnumerable<IDictionary<string, Method>> traits, string defaultMediaType)
		{
            var dynamicRaml = (IDictionary<string, object>)parentDynamicRaml[key];
            var resource = new Resource();

			new BasicInfoBuilder().Set(dynamicRaml, resource);

			//resource.RelativeUri = dynamicRaml.ContainsKey("relativeUri") ? (string) dynamicRaml["relativeUri"] : null;
			resource.BaseUriParameters = ParametersBuilder.GetUriParameters(dynamicRaml, "baseUriParameters");
			resource.UriParameters = ParametersBuilder.GetUriParameters(dynamicRaml, "uriParameters");
			resource.DisplayName = dynamicRaml.ContainsKey("displayName") ? (string) dynamicRaml["displayName"] : null;
			resource.Protocols = ProtocolsBuilder.Get(dynamicRaml);
			resource.Resources = GetResources(dynamicRaml, resourceTypes, traits, defaultMediaType);

            resource.Methods = GetMethods(dynamicRaml, traits, defaultMediaType);

            resource.RelativeUri = key;

            //if (dynamicRaml.ContainsKey("type") && dynamicRaml["type"] != null)
            //{
            //    resource.Methods = ResourceTypeApplier.Apply(resourceTypes, dynamicRaml, resource.Methods.ToList(), traits);
            //}

            //if (dynamicRaml.ContainsKey("is") && dynamicRaml["is"] != null)
            //{
            //    var methods = resource.Methods.ToList();
            //    TraitsApplier.ApplyTraitsToMethods(methods, traits, TypeExtractor.GetIs(dynamicRaml));
            //    resource.Methods = methods;
            //}

	        return resource;
		}





        private static IEnumerable<Method> GetMethods(IDictionary<string, object> dynamicRaml, IEnumerable<IDictionary<string, Method>> traits, string defaultMediaType)
	    {
            var methods = new Collection<Method>();
	        foreach (var key in dynamicRaml.Keys.Where(k => Methods.Contains(k)))
	        {
                var method = new MethodBuilder().Build((IDictionary<string, object>)dynamicRaml[key], defaultMediaType);
	            method.Verb = key;

                //if(method.Is != null && method.Is.Any())
                //    TraitsApplier.ApplyTraitsToMethod(method, traits, method.Is);

	            methods.Add(method);
	        }
	        return methods;
	    }

	    private ICollection<Resource> GetResources(IDictionary<string, object> dynamicRaml, IEnumerable<IDictionary<string, ResourceType>> resourceTypes,
            IEnumerable<IDictionary<string, Method>> traits, string defaultMediaType)
		{
            var resources = new Collection<Resource>();
            foreach (var key in dynamicRaml.Keys.Where(k => k.StartsWith("/")))
            {
                var resource = new ResourceBuilder().Build(dynamicRaml, key, resourceTypes, traits, defaultMediaType);
                resource.RelativeUri = key;
                resources.Add(resource);
            }

            return resources;

		}
	}
}