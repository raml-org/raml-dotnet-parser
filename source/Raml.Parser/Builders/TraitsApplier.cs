using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
    public class TraitsApplier
    {
        public static void ApplyTraitsToMethods(ICollection<Method> methods, IEnumerable<IDictionary<string, Method>> traits, IEnumerable<string> isArray)
        {
            foreach (var @is in isArray)
            {
                if (traits.Any(t => t.ContainsKey(@is)))
                {
                    var trait = traits.First(t => t.ContainsKey(@is))[@is];
                    ApplyTraitToMethods(methods, trait);
                }
            }
        }

        public static void ApplyTraitsToMethod(Method method, IEnumerable<IDictionary<string, Method>> traits, IEnumerable<string> isArray)
        {
            foreach (var @is in isArray)
            {
                if (traits.Any(t => t.ContainsKey(@is)))
                {
                    var trait = traits.First(t => t.ContainsKey(@is))[@is];
                    ApplyTraitToMethod(method, trait);
                }
            }
        }


        private static void ApplyTraitToMethods(ICollection<Method> methods, Method trait)
        {
            foreach (var method in methods)
            {
                ApplyTraitToMethod(method, trait);
            }
        }

        private static void ApplyTraitToMethod(Method method, Method trait)
        {
            method.BaseUriParameters = trait.BaseUriParameters;
            method.Body = trait.Body;
            method.Headers = trait.Headers;
            method.Is = trait.Is;
            method.Protocols = trait.Protocols;
            method.QueryParameters = trait.QueryParameters;
            method.Responses = trait.Responses;
            method.SecuredBy = trait.SecuredBy;
            method.Verb = trait.Verb;
        }
    }
}