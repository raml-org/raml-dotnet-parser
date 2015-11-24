using System;
using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
    public class TypeBuilder
    {
        public static ICollection<RamlType> Get(IDictionary<string, object> dynamicRaml)
        {
            var ramlTypes = new List<RamlType>();
            if (!dynamicRaml.ContainsKey("types"))
                return ramlTypes;

            foreach (var type in (IDictionary<string, object>)dynamicRaml["types"])
            {
                var ramlType = new RamlType
                {
                    Name = type.Key,
                    Properties = GetProperties((IDictionary<string, object>) type.Value),
                    Type = GetTypeKind((IDictionary<string, object>)type.Value),
                    Example = GetExample((IDictionary<string, object>)type.Value),
                    Facets = GetFacets((IDictionary<string, object>)type.Value),
                    OtherProperties = GetOtherProperties((IDictionary<string, object>)type.Value)
                };
                ramlTypes.Add(ramlType);
            }
            return ramlTypes;
        }

        private static IDictionary<string, object> GetOtherProperties(IDictionary<string, object> value)
        {
            // TODO
            return value;
        }

        private static IDictionary<string, object> GetFacets(IDictionary<string, object> value)
        {
            if (!value.ContainsKey("facets"))
                return new Dictionary<string, object>();

            return ((IDictionary<string, object>) value["facets"]);
        }

        private static string GetTypeKind(IDictionary<string, object> dynamicRaml)
        {
            if (!dynamicRaml.ContainsKey("type") || dynamicRaml["type"] == null)
                return "object";

            return (string)dynamicRaml["type"];
        }

        private static string GetExample(IDictionary<string, object> dynamicRaml)
        {
            if (!dynamicRaml.ContainsKey("example") || dynamicRaml["example"] == null)
                return string.Empty;

            return dynamicRaml["example"].ToString();
        }

        private static IDictionary<string, Parameter> GetProperties(IDictionary<string, object> dynamicRaml)
        {
            var properties = new Dictionary<string, Parameter>();
            if (!dynamicRaml.ContainsKey("properties"))
                return properties;

            foreach (var property in (IDictionary<string, object>)dynamicRaml["properties"])
            {
                var key = property.Key;
                var required = true;

                if (key.EndsWith("?"))
                {
                    key = key.Substring(0, key.Length - 1);
                    required = false;
                }

                var type = property.Value as string;
                if (type != null)
                {
                    properties.Add(key, new Parameter { Type = type, Required = required});
                    continue;
                }

                var dictionary = property.Value as IDictionary<string, object>;
                if (dictionary != null)
                {
                    var prop = new ParameterBuilder().Build(dictionary);
                    properties.Add(key, prop);
                    continue;
                }

                throw new InvalidOperationException("Cannot parse property of type");
            }

            return properties;
        }
    }
}