using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace Raml.Parser.Expressions
{
	public class RamlDocument
	{
		private readonly IDictionary<string, object> dynamicRaml;

		public RamlDocument()
		{
			Resources = new Collection<Resource>();
			Documentation = new Collection<DocumentationItem>();
			BaseUriParameters = new Dictionary<string, Parameter>();
			SecuredBy = new Collection<string>();
			Protocols = new Collection<Protocol>();
			SecuritySchemes = new Collection<IDictionary<string, SecurityScheme>>();
			ResourceTypes = new Collection<IDictionary<string, ResourceType>>();
			Traits = new Collection<IDictionary<string, Method>>();
			Schemas = new Collection<IDictionary<string, string>>();
		}

		public RamlDocument(IDictionary<string, object> dynamicRaml)
		{
			this.dynamicRaml = dynamicRaml;
		}

		public IDictionary<string, object> RawContent { get { return dynamicRaml; } }

		public string BaseUri { get; set; }

		public string Title { get; set; }
		public string Version { get; set; }

		public string MediaType { get; set; }

		public IEnumerable<DocumentationItem> Documentation { get; set; }

		public IDictionary<string, Parameter> BaseUriParameters { get; set; }

		public IEnumerable<string> SecuredBy { get; set; }

		public IEnumerable<Protocol> Protocols { get; set; }

		public string Method { get; set; }

		public IEnumerable<IDictionary<string, SecurityScheme>> SecuritySchemes { get; set; }

		public IEnumerable<IDictionary<string, ResourceType>> ResourceTypes { get; set; }

		public IEnumerable<IDictionary<string, Method>> Traits { get; set; }

		public IEnumerable<IDictionary<string, string>> Schemas { get; set; }

		public ICollection<Resource> Resources { get; set; }
	}
}
