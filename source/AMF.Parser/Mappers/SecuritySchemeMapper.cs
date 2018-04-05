using System.Collections.Generic;
using AMF.Parser.Model;
using System.Linq;

namespace AMF.Parser.Mappers
{
    internal class SecuritySchemeMapper
    {
        internal static IEnumerable<SecurityScheme> Map(object[] securitySchemes)
        {
            if (securitySchemes == null)
                return new SecurityScheme[0];

            return securitySchemes.Select(s => Map(s as IDictionary<string, object>)).ToArray();
        }

        internal static SecurityScheme Map(IDictionary<string, object> security)
        {
            if (security == null)
                return null;

            return new SecurityScheme(security["name"] as string, security["type"] as string, security["displayName"] as string,
                security["description"] as string, ParameterMapper.Map(security["headers"] as object[]),
                ParameterMapper.Map(security["queryParameters"] as object[]),
                ResponseMapper.Map(security["responses"] as object[]), SettingsMapper.Map(security["settings"] as IDictionary<string, object>),
                ShapeMapper.Map(security["queryString"] as IDictionary<string, object>));
        }
    }
}