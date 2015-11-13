using System;
using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
    public static class ResourceTypeApplier
    {
        public static IEnumerable<Method> Apply(IEnumerable<IDictionary<string, ResourceType>> resourceTypes, IDictionary<string, object> dynamicRaml,
            ICollection<Method> methods, IEnumerable<IDictionary<string, Method>> traits)
        {
            var type = TypeExtractor.Get(dynamicRaml);

            ApplyToMethods(resourceTypes, methods, type, traits);

            return methods;
        }

        private static void ApplyToMethods(IEnumerable<IDictionary<string, ResourceType>> resourceTypes, ICollection<Method> methods, string type,
            IEnumerable<IDictionary<string, Method>> traits)
        {
            if (type == null || !resourceTypes.Any(t => t.ContainsKey(type)))
                return;

            var resourceType = resourceTypes.First(t => t.ContainsKey(type))[type];

            // handle traits
            TraitsApplier.ApplyTraitsToMethods(methods, traits, resourceType.Is);

            if (resourceType.Get != null &&
                !methods.Any(m => "get".Equals(m.Verb, StringComparison.OrdinalIgnoreCase)))
                methods.Add(GetMethod(resourceType.Get));
            if (resourceType.Delete != null &&
                !methods.Any(m => "delete".Equals(m.Verb, StringComparison.OrdinalIgnoreCase)))
                methods.Add(GetMethod(resourceType.Delete));
            if (resourceType.Options != null &&
                !methods.Any(m => "options".Equals(m.Verb, StringComparison.OrdinalIgnoreCase)))
                methods.Add(GetMethod(resourceType.Options));
            if (resourceType.Patch != null &&
                !methods.Any(m => "patch".Equals(m.Verb, StringComparison.OrdinalIgnoreCase)))
                methods.Add(GetMethod(resourceType.Patch));
            if (resourceType.Post != null &&
                !methods.Any(m => "post".Equals(m.Verb, StringComparison.OrdinalIgnoreCase)))
                methods.Add(GetMethod(resourceType.Post));
            if (resourceType.Put != null &&
                !methods.Any(m => "put".Equals(m.Verb, StringComparison.OrdinalIgnoreCase)))
                methods.Add(GetMethod(resourceType.Put));

            // handle nested resource type
            ApplyToMethods(resourceTypes, methods, resourceType.Type, traits);
        }

        private static Method GetMethod(Verb verb)
        {
            return new Method
            {
                Verb = verb.Type.ToString().ToLowerInvariant(),
                Body = new Dictionary<string, MimeType> { { "?????", verb.Body } },
                Description = verb.Description,
                Headers = verb.Headers,
                Responses = verb.Responses
            };
        }


    }
}