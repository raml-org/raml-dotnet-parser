using System;
using System.Collections.Generic;
using System.Linq;

namespace Raml.Parser.Builders
{
    public class DynamicRamlParser
    {
        // This is nonsense, why is the example returned as dictionary ?? I need the original string !
        public static string GetExample(IDictionary<string, object> value)
        {
            if (!value.ContainsKey("example"))
                return null;

            var asString = value["example"] as string;
            if (asString != null)
                return asString;

            var asObj = value["example"] as IDictionary<string, object>;
            if (asObj != null)
                return Serialize(asObj);

            var asArray = value["example"] as object[];
            if (asArray == null)
                return null;

            var res = "[";
            foreach (var example in asArray)
            {
                var ex = example as IDictionary<string, object>;
                if (ex != null)
                {
                    res += Serialize(ex);
                }
                else
                {
                    res += example.ToString();
                }
                res += "," + Environment.NewLine;
            }
            res += "]";

            return res;
        }

        private static string Serialize(IDictionary<string, object> ex)
        {
            var res = "{" + Environment.NewLine;
            foreach (var kv in ex)
            {
                res += "  \"" + kv.Key + "\": \"" + kv.Value + "\"," + Environment.NewLine;
            }
            res = res.Substring(0, res.Length - ("," + Environment.NewLine).Length);
            res += "}";
            return res;
        }

        public static string GetStringOrNull(IDictionary<string, object> dynamicRaml, string key)
        {
            return GetValueOrNull(dynamicRaml, key) as string;
        }

        public static int? GetIntOrNull(IDictionary<string, object> dynamicRaml, string key)
        {
            var obj = GetValueOrNull(dynamicRaml, key);
            if (obj == null)
                return null;

            int res;
            if (!int.TryParse(obj.ToString(), out res))
                return res;

            return null;
        }

        public static object GetValueOrNull(IDictionary<string, object> dynamicRaml, string key)
        {
            if (!dynamicRaml.ContainsKey(key))
                return null;

            return dynamicRaml[key];
        }

        public static IEnumerable<T> GetValueOrEmptyCollection<T>(IDictionary<string, object> dynamicRaml, string key)
        {
            if (!dynamicRaml.ContainsKey(key))
                return new List<T>();

            var arrayOfObjects = dynamicRaml[key] as object[];
            if (arrayOfObjects != null)
                return arrayOfObjects.Cast<T>();

            throw new InvalidOperationException("Cannot parse dynamic raml for: " + key);
        }

        public static IDictionary<string, T> GetDictionaryOrNull<T>(IDictionary<string, object> value, string key)
        {
            if (!value.ContainsKey(key))
                return new Dictionary<string, T>();

            return ((IDictionary<string, T>)value[key]);
        }

        public static bool? GetBoolOrNull(IDictionary<string, object> dynamicRaml, string key)
        {
            var obj = GetValueOrNull(dynamicRaml, key);
            if (obj == null)
                return null;

            bool res;
            if (!bool.TryParse((string)obj, out res))
                return res;

            return null;
        }
    }
}