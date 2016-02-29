using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
	public class MethodBuilder
	{
        public Method Build(IDictionary<string, object> dynamicRaml, string defaultMediaType)
		{
			var method = new Method();
			new BasicInfoBuilder().Set(dynamicRaml, method);

			method.Verb = dynamicRaml.ContainsKey("method") ? (string) dynamicRaml["method"] : null;
			method.Headers = dynamicRaml.ContainsKey("headers")
				? new ParametersBuilder(dynamicRaml["headers"] as IDictionary<string, object>).GetAsDictionary()
				: new Dictionary<string, Parameter>();

			method.Responses = dynamicRaml.ContainsKey("responses")
				? new ResponsesBuilder(dynamicRaml["responses"] as IDictionary<string, object>).Get(defaultMediaType)
				: new List<Response>();

			method.QueryParameters = dynamicRaml.ContainsKey("queryParameters")
				? new ParametersBuilder((IDictionary<string, object>) dynamicRaml["queryParameters"]).GetAsDictionary()
				: null;

			method.Body = dynamicRaml.ContainsKey("body")
                ? new BodyBuilder((IDictionary<string, object>)dynamicRaml["body"]).GetAsDictionary(defaultMediaType)
				: new Dictionary<string, MimeType>();

			method.BaseUriParameters = ParametersBuilder.GetUriParameters(dynamicRaml, "baseUriParameters");
			method.SecuredBy = GetSecuredBy(dynamicRaml);
			method.Protocols = ProtocolsBuilder.Get(dynamicRaml);
			method.Is = GetIs(dynamicRaml);
			method.Description = dynamicRaml.ContainsKey("description") ? (string) dynamicRaml["description"] : null;

            method.Annotations = AnnotationsBuilder.GetAnnotations(dynamicRaml);

			return method;
		}

		private static IEnumerable<string> GetIs(IDictionary<string, object> dynamicRaml)
		{
			if (!dynamicRaml.ContainsKey("is"))
				return null;
			
			var objectsAsArray = dynamicRaml["is"] as object[];

			if (objectsAsArray != null) 
				return objectsAsArray.Cast<string>();

			var objectAsString = dynamicRaml["is"] as string;
			return new[] {objectAsString};
		}

		public IEnumerable<string> GetSecuredBy(IDictionary<string, object> dynamicRaml)
		{
			var securedBy = new List<string>();

			if (!dynamicRaml.ContainsKey("securedBy"))
				return null;

			var objects = ((Object[]) dynamicRaml["securedBy"]);
			foreach (var obj in objects)
			{
				var dic = obj as IDictionary<string, object>;
				if (dic != null)
					securedBy.AddRange(dic.Keys);
				else if(obj != null)
					securedBy.Add(obj.ToString());
			}

			return securedBy;
		}

	}
}