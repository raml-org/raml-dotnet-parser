using System.Collections.Generic;
using System.Linq;

namespace Raml.Parser.Builders
{
    public class AnnotationsBuilder
    {
        public static IDictionary<string, object> GetAnnotations(IDictionary<string, object> dynamicRaml)
        {
            return dynamicRaml.Where(p => p.Key.StartsWith("(") && p.Key.EndsWith(")")).ToDictionary(p => p.Key, p => p.Value);
        }
    }
}