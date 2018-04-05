using System;
using System.Collections.Generic;
using AMF.Parser.Model;
using System.Linq;

namespace AMF.Parser.Mappers
{
    internal class ParameterMapper
    {
        internal static IEnumerable<Parameter> Map(object[] parameters)
        {
            if (parameters == null)
                return new Parameter[0];

            return parameters.Select(p => Map(p as IDictionary<string, object>)).ToArray();
        }

        private static Parameter Map(IDictionary<string, object> doc)
        {
            if (doc == null)
                return null;

            var required = doc["required"] != null ? Convert.ToBoolean(doc["required"]) : false;
            return new Parameter(doc["name"] as string, doc["description"] as string, required, doc["binding"] as string, 
                ShapeMapper.Map(doc["schema"] as IDictionary<string, object>));
        }
    }
}