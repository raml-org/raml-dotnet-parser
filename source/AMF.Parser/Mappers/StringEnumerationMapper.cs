using System.Linq;
using System.Collections.Generic;

namespace AMF.Parser.Mappers
{
    internal static class StringEnumerationMapper
    {
        internal static IEnumerable<string> Map(object[] stringEnumeration)
        {
            if (stringEnumeration == null)
                return new string[0];

            return stringEnumeration.Select(a => a as string).ToArray();
        }
    }
}