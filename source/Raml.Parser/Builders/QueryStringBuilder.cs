using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
    public class QueryStringBuilder
    {
        public QueryString Build(IDictionary<string, object> dynamicRaml)
        {
            var queryString = new QueryString
            {
                Type = GetParameters(dynamicRaml),
                DisplayName = dynamicRaml.ContainsKey("displayName") ? (string) dynamicRaml["displayName"] : null,
                Examples = GetExamples(dynamicRaml)
            };
            return queryString;
        }

        private static string[] GetParameters(IDictionary<string, object> dynamicRaml)
        {
            var parameters = new string[0];
            if(!dynamicRaml.ContainsKey("type"))
                return parameters;

            var asObjArray = dynamicRaml["type"] as object[];
            if (asObjArray == null)
                return parameters;

            return asObjArray.Cast<string>().ToArray();
        }

        private IDictionary<string, string> GetExamples(IDictionary<string, object> dynamicRaml)
        {
            var examples = new Dictionary<string, string>();

            if (!dynamicRaml.ContainsKey("examples"))
                return examples;
            
            var asDic = dynamicRaml["examples"] as IDictionary<string, object>;
            if(asDic == null)
                return examples;

            foreach (var kv in asDic)
            {
                var asString = kv.Value as string;
                if(asString != null)
                    examples.Add(kv.Key, asString);
            }
            return examples;
        }
    }
}