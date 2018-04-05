using System.Collections.Generic;
using AMF.Parser.Model;
using System.Linq;

namespace AMF.Parser.Mappers
{
    internal class ParametrizedSecuritySchemeMapper
    {
        internal static IEnumerable<ParametrizedSecurityScheme> Map(object[] securitySchemes)
        {
            if (securitySchemes == null)
                return new ParametrizedSecurityScheme[0];

            return securitySchemes.Select(s => Map(s as IDictionary<string, object>)).ToArray();
        }

        private static ParametrizedSecurityScheme Map(IDictionary<string, object> security)
        {
            if (security == null)
                return null;

            return new ParametrizedSecurityScheme(security["name"] as string, 
                SecuritySchemeMapper.Map(security["securityScheme"] as IDictionary<string, object>), 
                SettingsMapper.Map(security["settings"] as IDictionary<string, object>));
        }
    }
}