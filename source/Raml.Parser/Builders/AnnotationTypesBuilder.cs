using System;
using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
    public class AnnotationTypesBuilder
    {
        public static IDictionary<string, AnnotationType> Get(IDictionary<string, object> dynamicRaml)
        {
            if (!dynamicRaml.ContainsKey("annotationTypes"))
                return new Dictionary<string, AnnotationType>();

            return GetAnnotationTypes(dynamicRaml);
        }

        private static IDictionary<string, AnnotationType> GetAnnotationTypes(IDictionary<string, object> dynamicRaml)
        {
            var annotationTypes = new Dictionary<string, AnnotationType>();
            var annotationTypesInRaml = dynamicRaml["annotationTypes"];
            var objects = annotationTypesInRaml as IDictionary<string, object>;
            if (objects != null)
                GetAnnotationTypesInDictionary(annotationTypesInRaml, annotationTypes);
            else
                GetAnnotationTypesInList(annotationTypes, annotationTypesInRaml);

            return annotationTypes;
        }

        private static void GetAnnotationTypesInList(Dictionary<string, AnnotationType> annotationTypes, object annotationTypesInRaml)
        {
            var array = annotationTypesInRaml as object[];
            foreach (var annotationType in array)
            {
                GetAnnotationTypesInDictionary(annotationType, annotationTypes);
            }
        }

        private static void GetAnnotationTypesInDictionary(object annotationType, Dictionary<string, AnnotationType> annotationTypes)
        {
            var dic = annotationType as IDictionary<string, object>;
            if (dic == null) return;
            GetAnnotationTypes(dic, annotationTypes);
        }

        private static void GetAnnotationTypes(IDictionary<string, object> objects, Dictionary<string, AnnotationType> annotationTypes)
        {
            foreach (var annotationType in objects)
            {
                GetAnnotationType(annotationType, annotationTypes);
            }
        }

        private static void GetAnnotationType(KeyValuePair<string, object> annotationType, Dictionary<string, AnnotationType> annotationTypes)
        {
            var dictionary = annotationType.Value as IDictionary<string, object>;

            var annotation = dictionary != null
                ? GetAnnotationType(dictionary)
                : new AnnotationType
                {
                    Parameters = new Dictionary<string, Parameter> {{annotationType.Key, new Parameter()}}
                };

            annotationTypes.Add(annotationType.Key, annotation);
        }

        private static AnnotationType GetAnnotationType(IDictionary<string, object> annotationType)
        {
            return new AnnotationType
            {
                AllowMultiple = annotationType.ContainsKey("allowMultiple") && Convert.ToBoolean(annotationType["allowMultiple"]),
                Description = annotationType.ContainsKey("description") ? (string)annotationType["description"] : string.Empty,
                DisplayName = annotationType.ContainsKey("displayName") ? (string)annotationType["displayName"] : string.Empty,
                Usage = annotationType.ContainsKey("usage") ? (string)annotationType["usage"] : string.Empty,
                Parameters = GetParameters(annotationType),
                AllowedTargets = GetAllowedTargets(annotationType),
                Annotations = AnnotationsBuilder.GetAnnotations(annotationType)
            };
        }

        private static IDictionary<string, Parameter> GetParameters(IDictionary<string, object> annotationType)
        {
            var parameters = new Dictionary<string, Parameter>();
            if (!annotationType.ContainsKey("parameters"))
                return parameters;

            foreach (var pair in (IDictionary<string, object>)annotationType["parameters"])
            {
                var dynamicRaml = pair.Value as IDictionary<string, object>;
                var parameter = dynamicRaml != null ? new ParameterBuilder().Build(dynamicRaml) : new Parameter();
                parameters.Add(pair.Key, parameter);
            }
            return parameters;
        }


        private static ICollection<string> GetAllowedTargets(IDictionary<string, object> annotationType)
        {
            var allowedTargets = new List<string>();
            if (!annotationType.ContainsKey("allowedTargets"))
                return allowedTargets;

            var allowedTarget = annotationType["allowedTargets"] as string;
            if (allowedTarget != null)
            {
                allowedTargets.Add(allowedTarget);
                return allowedTargets;
            }

            var targets = annotationType["allowedTargets"] as object[];
            if(targets == null)
                throw new InvalidOperationException("Cannot parse allowed targets");

            return targets.Cast<string>().ToList();
        }
        
    }
}