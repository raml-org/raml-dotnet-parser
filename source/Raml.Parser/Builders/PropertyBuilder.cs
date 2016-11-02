using System;
using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
    public class PropertyBuilder
    {
        public Property Build(IDictionary<string, object> dynamicRaml)
        {
            var prop = new Property();
            ParameterBuilder.SetProperties(dynamicRaml, prop);
            prop.Facets = TypeExtractor.GetType(dynamicRaml, "string");
            prop.Format = GetFormat(dynamicRaml);
            prop.MultipleOf = dynamicRaml.ContainsKey("multipleOf") ? Convert.ToInt32(dynamicRaml["multipleOf"]) : (int?)null;
            prop.FileTypes = GetFileTypes(dynamicRaml).ToList();
            return prop;
        }

        private static string GetFormat(IDictionary<string, object> dynamicRaml)
        {
            if (!dynamicRaml.ContainsKey("format"))
                return null;

            return (string) dynamicRaml["format"];
        }

        private static IEnumerable<string> GetFileTypes(IDictionary<string, object> dynamicRaml)
        {
            var types = new List<string>();
            if (!dynamicRaml.ContainsKey("fileTypes"))
            {
                return types;
            }

            var fileTypes = dynamicRaml["fileTypes"] as object[];
            if (fileTypes == null)
                return types;

            return fileTypes.Cast<string>();
        }
    }
}