using System.Collections.Generic;
using RAML.Parser.Model;

namespace RAML.Parser.Mappers
{
    internal class OrganizationMapper
    {
        internal static Organization Map(IDictionary<string, object> org)
        {
            if (org == null)
                return null;

            return new Organization(org["url"] as string, org["name"] as string, org["email"] as string);
        }
    }
}