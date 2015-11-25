using System.Collections;
using System.Collections.Generic;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class DocumentationItemBuilder
	{
		public DocumentationItem Build(IDictionary<string, object> dynamicRaml)
		{
		    var item = new DocumentationItem
		    {
		        Title = dynamicRaml.ContainsKey("title") ? (string) dynamicRaml["title"] : null,
		        Content = dynamicRaml.ContainsKey("content") ? (string) dynamicRaml["content"] : null,
		        Annotations = AnnotationsBuilder.GetAnnotations(dynamicRaml)
		    };
		    return item;
		}
	}
}