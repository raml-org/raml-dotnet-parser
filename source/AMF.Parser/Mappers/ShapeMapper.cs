using System.Collections.Generic;
using AMF.Parser.Model;
using System.Linq;
using AMF.Parser.Utils;

namespace AMF.Parser.Mappers
{
    internal class ShapeMapper
    {
        private static SchemaShape MapSchema(IDictionary<string, object> schema)
        {
            if (schema == null)
                return null;

            var @default = Map(schema["default"] as IDictionary<string, object>);

            return new SchemaShape(schema["mediaType"] as string, schema["raw"] as string, 
                DocumentationMapper.Map(schema["documentation"] as IDictionary<string, object>), 
                XmlSerializerMapper.Map(schema["xmlSerialization"] as IDictionary<string, object>), ExampleMapper.Map(schema["examples"] as object[]),
                schema["id"] as string, schema["name"] as string, schema["displayName"] as string, schema["description"] as string, @default,
                StringEnumerationMapper.Map(schema["values"] as object[]), Map(schema["inherits"] as object[]),
                GetLinkTargetName(schema));
        }

        internal static Shape Map(IDictionary<string, object> shape)
        {
            if (shape == null)
                return null;

            string linkTargetName = GetLinkTargetName(shape);

            if((shape["isFile"] as bool?) == true)
            {
                var multipleOf = ParameterMapperUtils.MapInt(shape, "multipleOf");
                var format = shape["format"] as string;
                var exclusiveMaximum = shape["exclusiveMaximum"] is bool ? ParameterMapperUtils.MapBool(shape, "exclusiveMaximum").ToString() : null;
                var exclusiveMinimum = shape["exclusiveMinimum"] is bool ? ParameterMapperUtils.MapBool(shape, "exclusiveMinimum").ToString() : null;
                var maximum = shape["maximum"] is int ? ParameterMapperUtils.MapInt(shape, "maximum").ToString() : null;
                var minimum = shape["minimum"] is int ? ParameterMapperUtils.MapInt(shape, "minimum").ToString() : null;
                var maxLength = ParameterMapperUtils.MapInt(shape, "maxLength");
                var minLength = ParameterMapperUtils.MapInt(shape, "minLength");
                var pattern = shape["pattern"] as string;
                return GetFileShape(shape, linkTargetName, multipleOf, format, exclusiveMaximum, exclusiveMinimum, maximum, minimum, maxLength, minLength, pattern);
            }

            var @default = Map(shape["default"] as IDictionary<string, object>);

            if (shape["items"] != null) // Array
            {
                return new ArrayShape(Map(shape["items"] as IDictionary<string, object>), ParameterMapperUtils.MapInt(shape, "minItems"),
                    ParameterMapperUtils.MapInt(shape, "maxItems"), ParameterMapperUtils.MapBool(shape, "uniqueItems"),
                    DocumentationMapper.Map(shape["documentation"] as IDictionary<string, object>),
                    XmlSerializerMapper.Map(shape["xmlSerialization"] as IDictionary<string, object>), ExampleMapper.Map(shape["examples"] as object[]),
                shape["id"] as string, shape["name"] as string, shape["displayName"] as string, shape["description"] as string, @default,
                StringEnumerationMapper.Map(shape["values"] as object[]), Map(shape["inherits"] as object[]), linkTargetName);
            }

            if ((shape["properties"] as object[]) != null && (shape["properties"] as object[]).Length > 0) // Node
            {
                return new NodeShape(ParameterMapperUtils.MapInt(shape, "minProperties"),
                    ParameterMapperUtils.MapInt(shape, "maxProperties"), ParameterMapperUtils.MapBool(shape, "closed"),
                    shape["discriminator"] as string, shape["discriminatorValue"] as string, ParameterMapperUtils.MapBool(shape, "readOnly"),
                    PropertyShapeMapper.Map(shape["properties"] as object[]), PropertyDependenciesMapper.Map(shape["dependencies"] as object[]),
                    DocumentationMapper.Map(shape["documentation"] as IDictionary<string, object>),
                    XmlSerializerMapper.Map(shape["xmlSerialization"] as IDictionary<string, object>), ExampleMapper.Map(shape["examples"] as object[]),
                shape["id"] as string, shape["name"] as string, shape["displayName"] as string, shape["description"] as string, @default,
                StringEnumerationMapper.Map(shape["values"] as object[]), Map(shape["inherits"] as object[]), linkTargetName);
            }

            if (shape["dataType"] != null || (shape["fileTypes"] != null && (shape["fileTypes"] as object[]).Count() > 0)) // Scalar or File
            {
                var multipleOf = ParameterMapperUtils.MapInt(shape, "multipleOf");
                var format = shape["format"] as string;
                var exclusiveMaximum = shape["exclusiveMaximum"] is bool ? ParameterMapperUtils.MapBool(shape, "exclusiveMaximum").ToString() : null;
                var exclusiveMinimum = shape["exclusiveMinimum"] is bool ? ParameterMapperUtils.MapBool(shape, "exclusiveMinimum").ToString() : null;
                var maximum = shape["maximum"] is int ? ParameterMapperUtils.MapInt(shape, "maximum").ToString() : null;
                var minimum = shape["minimum"] is int ? ParameterMapperUtils.MapInt(shape, "minimum").ToString() : null;
                var maxLength = ParameterMapperUtils.MapInt(shape, "maxLength");
                var minLength = ParameterMapperUtils.MapInt(shape, "minLength");
                var pattern = shape["pattern"] as string;

                if (shape["dataType"] != null) // Scalar
                {
                    var dataType = shape["dataType"] as string;

                    return new ScalarShape(dataType, pattern, minLength, maxLength, minimum, maximum, exclusiveMinimum, exclusiveMaximum, format, multipleOf,
                        DocumentationMapper.Map(shape["documentation"] as IDictionary<string, object>),
                        XmlSerializerMapper.Map(shape["xmlSerialization"] as IDictionary<string, object>), ExampleMapper.Map(shape["examples"] as object[]),
                shape["id"] as string, shape["name"] as string, shape["displayName"] as string, shape["description"] as string, @default,
                StringEnumerationMapper.Map(shape["values"] as object[]), Map(shape["inherits"] as object[]), linkTargetName);
                }
                else // File
                {
                    return GetFileShape(shape, linkTargetName, multipleOf, format, exclusiveMaximum, exclusiveMinimum, maximum, minimum, maxLength, minLength, pattern);
                }
            }

            if (shape.ContainsKey("raw") && shape["raw"] != null)
                MapSchema(shape);

            return new AnyShape(DocumentationMapper.Map(shape["documentation"] as IDictionary<string, object>),
                XmlSerializerMapper.Map(shape["xmlSerialization"] as IDictionary<string, object>), ExampleMapper.Map(shape["examples"] as object[]),
                shape["id"] as string, shape["name"] as string, shape["displayName"] as string, shape["description"] as string, @default,
                StringEnumerationMapper.Map(shape["values"] as object[]), Map(shape["inherits"] as object[]), linkTargetName);
        }

        private static Shape GetFileShape(IDictionary<string, object> shape, string linkTargetName, int multipleOf, string format, string exclusiveMaximum, string exclusiveMinimum, string maximum, string minimum, int maxLength, int minLength, string pattern)
        {
            var fileTypes = StringEnumerationMapper.Map(shape["fileTypes"] as object[]);
            var @default = Map(shape["default"] as IDictionary<string, object>);

            return new FileShape(pattern, minLength, maxLength, minimum, maximum, exclusiveMinimum, exclusiveMaximum, format, multipleOf, fileTypes,
                DocumentationMapper.Map(shape["documentation"] as IDictionary<string, object>),
                XmlSerializerMapper.Map(shape["xmlSerialization"] as IDictionary<string, object>), ExampleMapper.Map(shape["examples"] as object[]),
        shape["id"] as string, shape["name"] as string, shape["displayName"] as string, shape["description"] as string, @default,
        StringEnumerationMapper.Map(shape["values"] as object[]), Map(shape["inherits"] as object[]), linkTargetName);
        }

        private static string GetLinkTargetName(IDictionary<string, object> shape)
        {
            if (!shape.ContainsKey("linkTarget"))
                return null;

            var linkTarget = shape["linkTarget"];
            var linkTargetName = ParameterMapperUtils.Map<string>((IDictionary<string, object>)linkTarget, "name");
            return linkTargetName;
        }

        public static IEnumerable<Shape> Map(object[] shapes)
        {
            if (shapes == null)
                return new Shape[0];

            return shapes.Select(s => Map(s as IDictionary<string, object>)).ToArray();
        }
    }
}