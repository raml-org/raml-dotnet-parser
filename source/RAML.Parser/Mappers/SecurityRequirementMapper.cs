using System.Collections.Generic;
using RAML.Parser.Model;
using System.Linq;

namespace RAML.Parser.Mappers
{
    internal class SecurityRequirementMapper
    {
        internal static IEnumerable<SecurityRequirement> Map(object[] securityRequirements)
        {
            if (securityRequirements == null)
                return new SecurityRequirement[0];

            return securityRequirements.Select(s => Map(s as IDictionary<string, object>)).ToArray();
        }

        private static SecurityRequirement Map(IDictionary<string, object> securityReq)
        {
            if (securityReq == null)
                return null;

            var paramSecSchemes = securityReq["schemes"] as object[];
            return new SecurityRequirement(ParametrizedSecuritySchemeMapper.Map(paramSecSchemes));
        }

    }
}