using AMF.Parser.Model;
using System.Collections.Generic;
using System.Linq;

namespace AMF.Parser.Mappers
{
    internal class PropertyDependenciesMapper
    {
        internal static IEnumerable<PropertyDependency> Map(object[] dependencies)
        {
            if (dependencies == null)
                return new PropertyDependency[0];

            return dependencies.Select(d => Map(d as IDictionary<string, object>)).ToArray();
        }

        private static PropertyDependency Map(IDictionary<string, object> dep)
        {
            if (dep == null)
                return null;

            return new PropertyDependency(dep["propertySource"] as string, StringEnumerationMapper.Map(dep["propertyTarget"] as object[]));
        }
    }
}