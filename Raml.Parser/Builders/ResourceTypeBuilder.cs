using System;
using System.Collections.Generic;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class ResourceTypeBuilder
	{
		public ResourceType Build(IDictionary<string, object> dynamicRaml)
		{
			var resourceType = new ResourceType
			{
			    Get = getVerb(dynamicRaml, "get", VerbType.GET),
			    Post = getVerb(dynamicRaml, "post", VerbType.POST),
			    Put = getVerb(dynamicRaml, "put", VerbType.PUT),
			    Delete = getVerb(dynamicRaml, "delete", VerbType.DELETE),
			    Patch = getVerb(dynamicRaml, "patch", VerbType.PATCH),
			    Options = getVerb(dynamicRaml, "options", VerbType.OPTIONS)
			};

		    return resourceType;
		}

	    private Verb getVerb(IDictionary<string,object> dynamicRaml, string key, VerbType typeOfVerb)
	    {
	        var secondKey = String.Format("{0}?",key);

            return dynamicRaml.ContainsKey(key)
                ? new Verb((IDictionary<string, object>)dynamicRaml[key], typeOfVerb)
                : (dynamicRaml.ContainsKey(secondKey)
                    ? new Verb((IDictionary<string, object>)dynamicRaml[secondKey], typeOfVerb, true)
                    : null);

	    }
	}
}