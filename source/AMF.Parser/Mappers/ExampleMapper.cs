using System;
using System.Collections.Generic;
using AMF.Parser.Model;
using System.Linq;

namespace AMF.Parser.Mappers
{
    internal class ExampleMapper
    {
        internal static IEnumerable<Example> Map(object[] examples)
        {
            if (examples == null)
                return new Example[0];

            return examples.Select(e => Map(e as IDictionary<string, object>)).ToArray();
        }

        private static Example Map(IDictionary<string, object> example)
        {
            if (example == null)
                return null;

            return new Example(example["name"] as string, example["displayName"] as string, example["description"] as string, example["value"] as string,
                example["strict"] == null ? false : Convert.ToBoolean(example["strict"]), example["mediaType"] as string);
        }
    }
}