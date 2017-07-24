using System;
using System.Collections.Generic;
using System.Dynamic;
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

            method.QueryString = GetQueryString(dynamicRaml);

            method.Body = dynamicRaml.ContainsKey("body")
                ? new BodyBuilder((IDictionary<string, object>)dynamicRaml["body"]).GetAsDictionary(defaultMediaType)
				: new Dictionary<string, MimeType>();

			method.BaseUriParameters = ParametersBuilder.GetUriParameters(dynamicRaml, "baseUriParameters");
			method.SecuredBy = GetSecuredBy(dynamicRaml);
			method.Protocols = ProtocolsBuilder.Get(dynamicRaml);
			method.Is = IsExtractor.Get(dynamicRaml);
			method.Description = BasicInfoBuilder.GetDescription(dynamicRaml);
            method.Annotations = AnnotationsBuilder.GetAnnotations(dynamicRaml);

			return method;
		}

	    private static QueryString GetQueryString(IDictionary<string, object> dynamicRaml)
	    {
	        if (!dynamicRaml.ContainsKey("queryString"))
                return new QueryString();

	        var asDic = dynamicRaml["queryString"] as IDictionary<string, object>;
	        return new QueryStringBuilder().Build(asDic);
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