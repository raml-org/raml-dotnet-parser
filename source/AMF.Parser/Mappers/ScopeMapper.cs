using AMF.Parser.Model;
using System.Collections.Generic;
using System.Linq;

namespace AMF.Parser.Mappers
{
    internal class ScopeMapper
    {
        internal static IEnumerable<Scope> Map(object[] scopes)
        {
            if (scopes == null)
                return new Scope[0];

            return scopes.Select(s => Map(s as IDictionary<string, object>)).ToArray();
        }

        private static Scope Map(IDictionary<string, object> scope)
        {
            if (scope == null)
                return null;

            return new Scope(scope["name"] as string, scope["description"] as string);
        }
    }
}