using System;
using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
    public class TypeBuilder
    {
        private static readonly string[] PrimitiveTypes = { "string", "number", "integer", "boolean", "date", "file" };
        private static RamlTypesOrderedDictionary ramlTypes = new RamlTypesOrderedDictionary();
        public static RamlTypesOrderedDictionary Get(IDictionary<string, object> dynamicRaml)
        {
            ramlTypes = new RamlTypesOrderedDictionary();
            if (!dynamicRaml.ContainsKey("types"))
                return ramlTypes;

            var dynamicTypes = dynamicRaml["types"] as object[];
            if (dynamicTypes != null)
            {
                foreach (var dynamicType in dynamicTypes)
                {
                    var dic = dynamicType as IDictionary<string, object>;
                    foreach (var kv in dic)
                    {
                        ramlTypes.Add(kv.Key, GetRamlType(kv));
                    }
                }
                return ramlTypes;
            }

            var types = dynamicRaml["types"] as IDictionary<string, object>;
            if (types == null)
                return ramlTypes;

            foreach (var type in types)
            {
                ramlTypes.Add(type.Key, GetRamlType(type));
            }
            return ramlTypes;
        }

        public static RamlType GetRamlType(KeyValuePair<string, object> type)
        {
            var key = type.Key;
            var required = true;

            if (key.EndsWith("?"))
            {
                key = key.Substring(0, key.Length - 1);
                required = false;
            }

            var ramlType = new RamlType();
            ramlType.Name = key;
            ramlType.Required = required;

            var simpleProperty = type.Value as string;
            if (simpleProperty != null)
            {
                if (simpleProperty.StartsWith("<"))
                {
                    ramlType.External = new ExternalType
                    {
                        Xml = simpleProperty
                    };
                    return ramlType;
                }
                if (simpleProperty.StartsWith("{"))
                {
                    ramlType.External = new ExternalType
                    {
                        Schema = simpleProperty
                    };
                    return ramlType;
                }

                ramlType.Scalar = GetScalar(type, required);
                return ramlType;
            }

            var dynamicRaml = type.Value as IDictionary<string, object>;
            if (dynamicRaml == null)
                throw new InvalidOperationException("Cannot parse type: " + type.Key);

            ramlType = new RamlType
            {
                Name = type.Key,
                Type = TypeExtractor.GetType((IDictionary<string, object>)type.Value, "object"),
                Example = DynamicRamlParser.GetStringOrNull((IDictionary<string, object>)type.Value, "example"),
                Facets = DynamicRamlParser.GetDictionaryOrNull<object>((IDictionary<string, object>) type.Value, "facets"),
                OtherProperties = GetOtherProperties((IDictionary<string, object>) type.Value)
            };

            SetPropertiesByType(type, ramlType);

            return ramlType;
        }

        private static IDictionary<string, object> GetOtherProperties(IDictionary<string, object> value)
        {
            // TODO
            return value;
        }

        private static string GetRamlTypeType(IDictionary<string, object> dynamicRaml)
        {
            if (!dynamicRaml.ContainsKey("type") || dynamicRaml["type"] == null)
                return "object";

            return (string)dynamicRaml["type"];
        }

        private static void SetPropertiesByType(KeyValuePair<string, object> pair, RamlType ramlType)
        {
            var dynamicRaml = pair.Value as IDictionary<string, object>;

            if (PrimitiveTypes.Contains(ramlType.Type))
            {
                ramlType.Scalar = GetScalar(pair, ramlType.Required);
                return;
            }

            if (ramlType.Type.StartsWith("{"))
            {
                ramlType.External = new ExternalType {Schema = ramlType.Type};
                return;
            }
            if (ramlType.Type.StartsWith("<"))
            {
                ramlType.External = new ExternalType { Xml = ramlType.Type };
                return;
            }

            if (ramlType.Type == "object")
            {
                ramlType.Object = GetObject(dynamicRaml);
                return;
            }

            if (ramlType.Type == "array" || ramlType.Type.EndsWith("[]"))
            {
                ramlType.Array = GetArray(dynamicRaml, pair.Key);
                return;
            }

            if (ramlTypes.ContainsKey(ramlType.Type))
            {
                // Inheritance or Specialization
                var parentType = ramlTypes[ramlType.Type];
                if (parentType.Scalar != null)
                {
                    ramlType.Scalar = GetScalar(new KeyValuePair<string, object>(ramlType.Name, dynamicRaml), ramlType.Required);
                    return;
                }

                if (parentType.Object != null)
                {
                    ramlType.Object = GetObject(dynamicRaml);
                    return;
                }
            }

            if (ramlType.Type.Contains("|")) // Union Type
            {
                return;
            }

            throw new InvalidOperationException("Cannot parse type: " + dynamicRaml["type"]);
        }

        private static ArrayType GetArray(IDictionary<string, object> dynamicRaml, string key)
        {
            var array = new ArrayType();
            array.MaxItems = DynamicRamlParser.GetIntOrNull(dynamicRaml, "maxItems");
            array.MinItems = DynamicRamlParser.GetIntOrNull(dynamicRaml, "minItems");
            array.UniqueItems = DynamicRamlParser.GetBoolOrNull(dynamicRaml, "maxProperties");

            RamlType items = null;
            if (dynamicRaml.ContainsKey("items"))
            {
                items = GetRamlType(new KeyValuePair<string, object>("", (IDictionary<string, object>)dynamicRaml["items"]));
            }
            array.Items = items;

            return array;
        }

        private static ObjectType GetObject(IDictionary<string, object> dynamicRaml)
        {
            var obj = new ObjectType();

            obj.AdditionalProperties = DynamicRamlParser.GetValueOrNull(dynamicRaml, "additionalProperties");
            obj.Discriminator = DynamicRamlParser.GetValueOrNull(dynamicRaml, "discriminator");
            obj.DiscriminatorValue = DynamicRamlParser.GetStringOrNull(dynamicRaml, "discriminatorValue");
            obj.MaxProperties = DynamicRamlParser.GetIntOrNull(dynamicRaml, "maxProperties");
            obj.MinProperties = DynamicRamlParser.GetIntOrNull(dynamicRaml, "minProperties");
            obj.PatternProperties = DynamicRamlParser.GetValueOrNull(dynamicRaml, "patternProperties");

            var properties = new Dictionary<string, RamlType>();
            if (dynamicRaml.ContainsKey("properties"))
            {
                foreach (var property in (IDictionary<string, object>) dynamicRaml["properties"])
                {
                    properties.Add(property.Key, GetRamlType(property));
                }
            }

            obj.Properties = properties;
            return obj;
        }

        private static Property GetScalar(KeyValuePair<string, object> pair, bool required)
        {
            var type = pair.Value as string;
            Property scalar;
            if (type != null)
            {
                scalar = new Property {Type = type, Required = required};
            }
            else
            {
                var dictionary = pair.Value as IDictionary<string, object>;
                if (dictionary == null)
                    throw new InvalidOperationException("Cannot parse type of property: " + pair.Key);

                scalar = new PropertyBuilder().Build(dictionary);
            }
            return scalar;
        }
    }
}