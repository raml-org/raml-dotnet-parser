using System;
using System.Collections.Generic;
using System.Linq;

namespace Raml.Parser.Builders
{
    public static class TypeExtractor
    {
        public static string Get(IDictionary<string, object> dynamicRaml)
        {
            if (!dynamicRaml.ContainsKey("type"))
                return null;

            var type = dynamicRaml["type"] as string;

            if (type == null)
            {
                var nestedType = dynamicRaml["type"] as IDictionary<string, object>;
                if (nestedType == null)
                    return null;

                if (nestedType.Keys.Count != 1)
                {
                    return null;
                }

                type = nestedType.Keys.First();
            }
            return type;
        }

        public static string[] GetIs(IDictionary<string, object> dynamicRaml)
        {
            if (!dynamicRaml.ContainsKey("is"))
                return new string[0];

            var @is = dynamicRaml["is"] as string;
            if (@is != null)
                return new[] { @is };

            var isAsObj = dynamicRaml["is"] as object[];
            if (isAsObj != null)
                return isAsObj.Cast<string>().ToArray();

            throw new InvalidOperationException("Cannot parse 'is' property");
        }


    }
}