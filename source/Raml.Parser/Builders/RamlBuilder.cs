using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class RamlBuilder
	{
        
		public async Task<RamlDocument> Build(IDictionary<string, object> dynamicRaml, string path = null)
		{
            
			var doc = new RamlDocument(dynamicRaml);
            doc.Types = new RamlTypesOrderedDictionary();

		    if (dynamicRaml.ContainsKey("uses"))
		    {
		        var uses = dynamicRaml["uses"] as object[];
		        if (uses != null)
		        {
		            foreach (var library in uses)
		            {
		                var lib = library as IDictionary<string, object>;
		                if (lib != null)
		                {
		                    string filePath;
		                    if(path != null)
		                        filePath = Path.Combine(Path.GetDirectoryName(path), (string)lib["value"]);
                            else
                                filePath = (string)lib["value"];

                            var preffix = (string)lib["key"];
		                    var dynamic = await RamlParser.GetDynamicStructure(filePath);
		                    TypeBuilder.AddTypes(doc.Types, (IDictionary<string, object>) dynamic, preffix);
		                }
		            }
		        }
		    }

			doc.BaseUri = dynamicRaml.ContainsKey("baseUri") ? (string) dynamicRaml["baseUri"] : string.Empty;
            doc.Title = dynamicRaml.ContainsKey("title") ? (string)dynamicRaml["title"] : string.Empty;
			doc.Version = dynamicRaml.ContainsKey("version") ? (string)dynamicRaml["version"] : null;
			doc.MediaType = dynamicRaml.ContainsKey("mediaType") ? (string)dynamicRaml["mediaType"] : null;
			doc.Documentation = GetDocumentation(dynamicRaml);
			doc.BaseUriParameters = ParametersBuilder.GetUriParameters(dynamicRaml, "baseUriParameters");
			doc.SecuredBy = GetSecuredBy(dynamicRaml);
			doc.Method = dynamicRaml.ContainsKey("method") ? (string)dynamicRaml["method"] : null;
			doc.Protocols = ProtocolsBuilder.Get(dynamicRaml);
			doc.SecuritySchemes = GetSecuritySchemes(dynamicRaml, doc.MediaType);
			doc.ResourceTypes = GetResourceTypes(dynamicRaml, doc.MediaType);
			doc.Traits = GetTraits(dynamicRaml, doc.MediaType);
			doc.Schemas = GetSchemas(dynamicRaml);
			doc.Resources = GetResources(dynamicRaml, doc.ResourceTypes, doc.Traits, doc.MediaType);
		    
            TypeBuilder.AddTypes(doc.Types, dynamicRaml);

            doc.AnnotationTypes = AnnotationTypesBuilder.Get(dynamicRaml);
		    doc.Annotations = AnnotationsBuilder.GetAnnotations(dynamicRaml);
			return doc;
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
                var resource = new ResourceBuilder().Build((IDictionary<string, object>) res, resourceTypes, traits, defaultMediaType);
		        resources.Add(resource);
		    }

			return resources;
		}

		private IEnumerable<IDictionary<string, string>> GetSchemas(IDictionary<string, object> dynamicRaml)
		{
			return dynamicRaml.ContainsKey("schemas")
					? ((object[])dynamicRaml["schemas"])
						.Cast<IDictionary<string, object>>()
						.Select(o => o.ToDictionary(kv => kv.Key, kv => ParseSchema(kv.Value)))
						.ToArray()
					: new Dictionary<string, string>[0];
		}

	    private string ParseSchema(object val)
	    {
	        var asString = val as string;
	        if (asString != null)
	            return asString;

	        var value = val as IDictionary<string, object>;
	        if (!value.ContainsKey("type"))
	            return null;

	        var arr = value["type"] as object[]; // This is nonsense, why is the schema returned in an object array under the type key ??
	        if (arr != null)
	            return arr[0].ToString();

	        return null;
	    }

	    private IEnumerable<IDictionary<string, SecurityScheme>> GetSecuritySchemes(IDictionary<string, object> dynamicRaml,string defaultMediaType)
		{
			if (!dynamicRaml.ContainsKey("securitySchemes"))
				return new List<IDictionary<string, SecurityScheme>>();

			var schemes = (object[])dynamicRaml["securitySchemes"];

			return (from IDictionary<string, object> scheme in schemes
					select scheme
                    .ToDictionary(kv => kv.Key, kv => new SecuritySchemeBuilder().Build((IDictionary<string, object>)kv.Value, defaultMediaType)))
				.Cast<IDictionary<string, SecurityScheme>>()
				.ToList();
		}

		private static IEnumerable<DocumentationItem> GetDocumentation(IDictionary<string, object> dynamicRaml)
		{
			return dynamicRaml.ContainsKey("documentation")
				? ((object[]) dynamicRaml["documentation"]).Select(i => new DocumentationItemBuilder().Build((IDictionary<string, object>) i))
				: new List<DocumentationItem>();
		}

		private static IEnumerable<string> GetSecuredBy(IDictionary<string, object> dynamicRaml)
		{
			object value;
			var securedBy = new string[0];
			if (dynamicRaml.TryGetValue("securedBy", out value))
				securedBy = ((Object[]) value).Cast<string>().ToArray();
			return securedBy;
		}

        private IEnumerable<IDictionary<string, ResourceType>> GetResourceTypes(IDictionary<string, object> dynamicRaml, string defaultMediaType)
		{
			if (!dynamicRaml.ContainsKey("resourceTypes"))
				return new List<IDictionary<string, ResourceType>>();

			var resourceTypes = dynamicRaml["resourceTypes"] as object[];
            if (resourceTypes != null)
            {
                return (from IDictionary<string, object> dynamicResourceType in resourceTypes
                    select dynamicResourceType
                        .ToDictionary(kv => kv.Key,
                            kv =>
                                new ResourceTypeBuilder().Build((IDictionary<string, object>) kv.Value, defaultMediaType)))
                    .Cast<IDictionary<string, ResourceType>>()
                    .ToList();
            }

            var dynamicResourceTypes = dynamicRaml["resourceTypes"] as IDictionary<string, object>;

            var dic = new Dictionary<string, ResourceType>();
            foreach (var keyValuePair in dynamicResourceTypes)
            {
                var resourceType = new ResourceTypeBuilder().Build((IDictionary<string, object>) keyValuePair.Value, defaultMediaType);
                dic.Add(keyValuePair.Key, resourceType);
            }

            return new List<IDictionary<string, ResourceType>> { dic };
		}

        private IEnumerable<IDictionary<string, Method>> GetTraits(IDictionary<string, object> dynamicRaml, string defaultMediaType)
		{
			if (!dynamicRaml.ContainsKey("traits"))
				return new List<IDictionary<string, Method>>();

			var dynamicTraits = ((object[])dynamicRaml["traits"]).Cast<IDictionary<string, object>>();
			return dynamicTraits
				.Select(dyn => dyn
                    .ToDictionary(kv => kv.Key, kv => new MethodBuilder().Build((IDictionary<string, object>)kv.Value, defaultMediaType)))
				.ToArray();
		}


	}
}