using System;
using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class ResourceTypeBuilder
	{
        public ResourceType Build(IDictionary<string, object> dynamicRaml, string defaultMediaType)
		{
			var resourceType = new ResourceType
			{
                Type = TypeExtractor.Get(dynamicRaml),
                Is = TypeExtractor.GetIs(dynamicRaml),
                Get = GetVerb(dynamicRaml, "get", VerbType.GET, defaultMediaType),
                Post = GetVerb(dynamicRaml, "post", VerbType.POST, defaultMediaType),
                Put = GetVerb(dynamicRaml, "put", VerbType.PUT, defaultMediaType),
                Delete = GetVerb(dynamicRaml, "delete", VerbType.DELETE, defaultMediaType),
                Patch = GetVerb(dynamicRaml, "patch", VerbType.PATCH, defaultMediaType),
                Options = GetVerb(dynamicRaml, "options", VerbType.OPTIONS, defaultMediaType),
                Annotations = AnnotationsBuilder.GetAnnotations(dynamicRaml)
			};

		    return resourceType;
		}


        private Verb GetVerb(IDictionary<string, object> dynamicRaml, string key, VerbType typeOfVerb, string defaultMediaType)
	    {
	        var secondKey = String.Format("{0}?",key);

            return dynamicRaml.ContainsKey(key)
                ? new Verb((IDictionary<string, object>)dynamicRaml[key], typeOfVerb, defaultMediaType)
                : (dynamicRaml.ContainsKey(secondKey)
                    ? new Verb((IDictionary<string, object>)dynamicRaml[secondKey], typeOfVerb, defaultMediaType, true)
                    : null);

	    }
	}
}