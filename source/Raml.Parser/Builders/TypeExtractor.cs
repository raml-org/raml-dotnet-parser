using System;
using System.Collections.Generic;
using System.Linq;

namespace Raml.Parser.Builders
{
    public static class TypeExtractor
    {
        public static string GetType(IDictionary<string, object> dynamicRaml, string defaultType = null)
        {
            if (!dynamicRaml.ContainsKey("type"))
                return defaultType;

            var dynamicTypes = dynamicRaml["type"] as object[];

            if (dynamicTypes == null)
            {
                var asString = dynamicRaml["type"] as string;
                if (asString == null)
                {
                    var asDic = dynamicRaml["type"] as IDictionary<string, object>;
                    if (asDic == null)
                        return "string";

                    return GetType(asDic);
                }
                return string.IsNullOrWhiteSpace(asString) ? "string" : asString;
            }

            if (!dynamicTypes.Any())
                return defaultType;

            if (dynamicTypes.Length == 1 && (string) dynamicTypes.First() == "array" &&
                dynamicRaml.ContainsKey("items"))
            {
                var asString = dynamicRaml["items"] as string;
                if(asString != null)
                    return asString + "[]";

                var asDictionary = dynamicRaml["items"] as IDictionary<string, object>;
                if (asDictionary != null)
                    return GetType(asDictionary, defaultType) + "[]";
            }

            if (dynamicTypes.Length == 1)
                return (string)dynamicTypes.First();

            return "[" + string.Join(",", dynamicTypes.Cast<string>()) + "]";
        }

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