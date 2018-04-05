using System.Collections.Generic;

namespace AMF.Parser.Utils
{
    internal class ParameterMapperUtils
    {
        internal static T Map<T>(IDictionary<string, object> dictionary, string key)
        {
            if (!dictionary.ContainsKey(key))
                return default(T);

            return (T)dictionary[key];
        }

        internal static bool MapBool(IDictionary<string, object> dictionary, string key, bool defaultValue = false)
        {
            if (!dictionary.ContainsKey(key))
                return defaultValue;

            var value = dictionary[key] as bool?;
            return value ?? defaultValue;
        }

        internal static int MapInt(IDictionary<string, object> dictionary, string key, int defaultValue = 0)
        {
            if (!dictionary.ContainsKey(key))
                return defaultValue;

            var value = dictionary[key] as int?;
            return value ?? defaultValue;
        }

    }
}