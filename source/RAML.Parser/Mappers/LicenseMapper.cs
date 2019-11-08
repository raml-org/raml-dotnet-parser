using System.Collections.Generic;
using RAML.Parser.Model;

namespace RAML.Parser.Mappers
{
    internal class LicenseMapper
    {
        internal static License Map(IDictionary<string, object> lic)
        {
            if (lic == null)
                return null;

            return new License(lic["url"] as string, lic["name"] as string);
        }
    }
}