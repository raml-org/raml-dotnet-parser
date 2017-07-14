using System;
using System.Collections.Generic;
using System.Linq;
using Raml.Parser.Expressions;

namespace Raml.Parser.Builders
{
    public class TypeBuilder
    {
        private static readonly string[] PrimitiveTypes = { "string", "number", "integer", "boolean", "datetime", "datetime-only", "date-only", "time-only", "file", "any" };
        private static RamlTypesOrderedDictionary ramlTypes;
        private static string preffix;
        private static readonly IDictionary<string, object> defferredTypes = new Dictionary<string, object>();

        public static void AddTypes(RamlTypesOrderedDictionary ramlTypes_, IDictionary<string, object> dynamicRaml, string preffix_ = null)
        {
            preffix = preffix_;
            ramlTypes = ramlTypes_;
            defferredTypes.Clear();
            if (!dynamicRaml.ContainsKey("types"))
                return;

            var dynamicTypes = dynamicRaml["types"] as object[];
            if (dynamicTypes != null)
            {
                foreach (var dynamicType in dynamicTypes)
                {
                    var dic = dynamicType as IDictionary<string, object>;
                    foreach (var kv in dic)
                    {
                        var type = GetRamlType(kv);
                        var key = kv.Key;
                        
                        if (preffix != null)
                        {
                            type.LibraryName = preffix;
                            key = preffix + "." + key;
                        }
                        
                        ramlTypes.Add(key, type);
                    }
                }
                ParseDefferredTypes();
                return;
            }

            var types = dynamicRaml["types"] as IDictionary<string, object>;
            if (types == null)
                return;

            foreach (var type in types)
            {
                var ramlType = GetRamlType(type);
                ramlType.LibraryName = preffix;

                var key = type.Key;
                if (ramlType.LibraryName != null)
                    key = ramlType.LibraryName + "." + key;
                ramlTypes.Add(key, ramlType);

            }

            ParseDefferredTypes();
        }

        private static void ParseDefferredTypes()
        {
            foreach (var pair in defferredTypes)
            {
                var ramlType = ramlTypes[pair.Key];
                SetPropertiesByType(pair, ramlType);
            }
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

            var value = (IDictionary<string, object>)type.Value;
            ramlType = new RamlType
            {
                Name = type.Key,
                Type = GetType(value),
                Example = DynamicRamlParser.GetExample(value),
                Facets = DynamicRamlParser.GetDictionaryOrNull<object>(value, "facets"),
                OtherProperties = GetOtherProperties(value),
                Required = GetRequired(value, required)
            };

            SetPropertiesByType(type, ramlType);

            return ramlType;
        }

        private static bool GetRequired(IDictionary<string, object> value, bool required)
        {
            if (value.ContainsKey("required"))
            {
                bool result;
                var isRequired = value["required"] as bool?;
                if(isRequired != null)
                    return isRequired.Value;

                return required;
            }
            return required;
        }

        private static string GetType(IDictionary<string, object> typeValue)
        {
            var extractedType = TypeExtractor.GetType(typeValue, "object");
            if (preffix == null) 
                return extractedType;
            if (PrimitiveTypes.Contains(extractedType))
                return extractedType;

            if (extractedType == "object" || extractedType == "array")
                return extractedType;

            return preffix + "." + extractedType;
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

            if(ramlType == null)
                return;

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

            if (!defferredTypes.ContainsKey(pair.Key))
            {
                defferredTypes.Add(pair.Key, pair.Value);
            }
            else if (dynamicRaml.ContainsKey("properties"))
            {
                ramlType.Object = GetObject(dynamicRaml);
            }
            //throw new InvalidOperationException("Cannot parse type: " + ramlType.Type);
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
                var asDictionary = dynamicRaml["items"] as IDictionary<string, object>;
                if (asDictionary != null)
                {
                    items = GetRamlType(new KeyValuePair<string, object>("", asDictionary));
                }
                else
                {
                    var asString = dynamicRaml["items"] as string;
                    if (asString != null)
                    {
                        items = new RamlType {Type = asString};
                    }
                    else
                    {
                        var asObjectArray = dynamicRaml["items"] as object[];
                        if(asObjectArray != null)
                            items = new RamlType { Type = (string)asObjectArray[0] };
                    }
                }
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

            ParseProperties(dynamicRaml, obj);
            return obj;
        }

        private static void ParseProperties(IDictionary<string, object> dynamicRaml, ObjectType obj)
        {
            var properties = new Dictionary<string, RamlType>();
            if (dynamicRaml.ContainsKey("properties"))
            {
                foreach (var property in (IDictionary<string, object>) dynamicRaml["properties"])
                {
                    properties.Add(property.Key, GetRamlType(property));
                }
            }

            obj.Properties = properties;
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