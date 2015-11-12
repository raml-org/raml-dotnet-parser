using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class ResourceBuilder
	{
	    private static readonly string[] Methods = { "get", "post", "put", "delete", "patch", "options"};

	    public Resource Build(IDictionary<string, object> parentDynamicRaml, string key, IEnumerable<IDictionary<string, ResourceType>> resourceTypes)
		{
            var dynamicRaml = (IDictionary<string, object>)parentDynamicRaml[key];
            var resource = new Resource();

			new BasicInfoBuilder().Set(dynamicRaml, resource);

			//resource.RelativeUri = dynamicRaml.ContainsKey("relativeUri") ? (string) dynamicRaml["relativeUri"] : null;
			resource.BaseUriParameters = ParametersBuilder.GetUriParameters(dynamicRaml, "baseUriParameters");
			resource.UriParameters = ParametersBuilder.GetUriParameters(dynamicRaml, "uriParameters");
			resource.DisplayName = dynamicRaml.ContainsKey("displayName") ? (string) dynamicRaml["displayName"] : null;
			resource.Protocols = ProtocolsBuilder.Get(dynamicRaml);
			resource.Resources = GetResources(dynamicRaml, resourceTypes);

			resource.Methods = GetMethods(dynamicRaml);

            resource.RelativeUri = key;

	        if (dynamicRaml.ContainsKey("type") && dynamicRaml["type"] != null)
	        {
	            resource.Methods = ExtractMethodsFromResourceTypes(resourceTypes, dynamicRaml, resource.Methods.ToList());
	        }

	        if (dynamicRaml.ContainsKey("is"))
	        {
	            // handle traits
	        }

			return resource;
		}

	    private IEnumerable<Method> ExtractMethodsFromResourceTypes(IEnumerable<IDictionary<string, ResourceType>> resourceTypes, IDictionary<string, object> dynamicRaml, ICollection<Method> methods)
	    {
	        var type = dynamicRaml["type"] as string;

	        if (type == null)
	        {
	            var nestedType = dynamicRaml["type"] as IDictionary<string, object>;
	            if (nestedType.Keys.Count != 1)
	                return methods;

	            type =  nestedType.Keys.First();
	        }
	        if (!resourceTypes.Any(t => t.ContainsKey(type))) 
                return methods;

	        var resourceType = resourceTypes.First(t => t.ContainsKey(type))[type];

	        if (resourceType.Get != null &&
	            !methods.Any(m => "get".Equals(m.Verb, StringComparison.OrdinalIgnoreCase)))
	            methods.Add(GetMethod(resourceType.Get));
	        if (resourceType.Delete != null &&
	            !methods.Any(m => "delete".Equals(m.Verb, StringComparison.OrdinalIgnoreCase)))
	            methods.Add(GetMethod(resourceType.Delete));
	        if (resourceType.Options != null &&
	            !methods.Any(m => "options".Equals(m.Verb, StringComparison.OrdinalIgnoreCase)))
	            methods.Add(GetMethod(resourceType.Options));
	        if (resourceType.Patch != null &&
	            !methods.Any(m => "patch".Equals(m.Verb, StringComparison.OrdinalIgnoreCase)))
	            methods.Add(GetMethod(resourceType.Patch));
	        if (resourceType.Post != null &&
	            !methods.Any(m => "post".Equals(m.Verb, StringComparison.OrdinalIgnoreCase)))
	            methods.Add(GetMethod(resourceType.Post));
	        if (resourceType.Put != null &&
	            !methods.Any(m => "put".Equals(m.Verb, StringComparison.OrdinalIgnoreCase)))
	            methods.Add(GetMethod(resourceType.Put));

	        return methods;
	    }

	    private Method GetMethod(Verb verb)
	    {
	        return new Method
	        {
	            Verb = verb.Type.ToString().ToLowerInvariant(),
                Body = new Dictionary<string, MimeType> {{ "?????", verb.Body }},
                Description = verb.Description,
                Headers = verb.Headers,
                Responses = verb.Responses
	        };
	    }

	    private static IEnumerable<Method> GetMethods(IDictionary<string, object> dynamicRaml)
	    {
            var methods = new Collection<Method>();
	        foreach (var key in dynamicRaml.Keys.Where(k => Methods.Contains(k)))
	        {
	            var method = new MethodBuilder().Build((IDictionary<string, object>) dynamicRaml[key]);
	            method.Verb = key;
	            methods.Add(method);
	        }
	        return methods;
	    }

	    private ICollection<Resource> GetResources(IDictionary<string, object> dynamicRaml, IEnumerable<IDictionary<string, ResourceType>> resourceTypes)
		{
            var resources = new Collection<Resource>();
            foreach (var key in dynamicRaml.Keys.Where(k => k.StartsWith("/")))
            {
                var resource = new ResourceBuilder().Build(dynamicRaml, key, resourceTypes);
                resource.RelativeUri = key;
                resources.Add(resource);
            }

            return resources;

		}
	}
}