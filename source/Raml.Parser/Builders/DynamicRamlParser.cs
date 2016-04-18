using System;
using System.Collections.Generic;
using System.Linq;

namespace Raml.Parser.Builders
{
    public class DynamicRamlParser
    {
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