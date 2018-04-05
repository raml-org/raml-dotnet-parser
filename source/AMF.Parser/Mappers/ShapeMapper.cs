using System.Collections.Generic;
using AMF.Parser.Model;
using System.Linq;
using System;
using AMF.Parser.Utils;

namespace AMF.Parser.Mappers
{
    internal class ShapeMapper
    {
        private static SchemaShape MapSchema(IDictionary<string, object> schema)
        {
            if (schema == null)
                return null;

            return new SchemaShape(schema["mediaType"] as string, schema["raw"] as string, 
                DocumentationMapper.Map(schema["documentation"] as IDictionary<string, object>), 
                XmlSerializerMapper.Map(schema["xmlSerialization"] as IDictionary<string, object>), ExampleMapper.Map(schema["examples"] as object[]),
                schema["name"] as string, schema["displayName"] as string, schema["description"] as string, schema["default"] as string,
                StringEnumerationMapper.Map(schema["values"] as object[]), Map(schema["inherits"] as object[]),
                GetLinkTargetName(schema));
        }

        internal static Shape Map(IDictionary<string, object> shape)
        {
            if (shape == null)
                return null;

            string linkTargetName = GetLinkTargetName(shape);

            if (shape["items"] != null) // Array
            {
                return new ArrayShape(Map(shape["items"] as IDictionary<string, object>), ParameterMapperUtils.MapInt(shape, "minItems"),
                    ParameterMapperUtils.MapInt(shape, "maxItems"), ParameterMapperUtils.MapBool(shape, "uniqueItems"),
                    DocumentationMapper.Map(shape["documentation"] as IDictionary<string, object>),
                    XmlSerializerMapper.Map(shape["xmlSerialization"] as IDictionary<string, object>), ExampleMapper.Map(shape["examples"] as object[]),
                shape["name"] as string, shape["displayName"] as string, shape["description"] as string, shape["default"] as string,
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
                shape["name"] as string, shape["displayName"] as string, shape["description"] as string, shape["default"] as string,
                StringEnumerationMapper.Map(shape["values"] as object[]), Map(shape["inherits"] as object[]), linkTargetName);
            }

            if (shape["dataType"] != null || shape["fileTypes"] != null) // Scalar or File
            {
                var multipleOf = ParameterMapperUtils.MapInt(shape, "multipleOf");
                var format = shape["format"] as string;
                var exclusiveMaximum = shape["exclusiveMaximum"] as string;
                var exclusiveMinimum = shape["exclusiveMinimum"] as string;
                var maximum = shape["maximum"] as string;
                var minimum = shape["minimum"] as string;
                var maxLength = ParameterMapperUtils.MapInt(shape, "maxLength");
                var minLength = ParameterMapperUtils.MapInt(shape, "minLength");
                var pattern = shape["pattern"] as string;

                if (shape["dataType"] != null) // Scalar
                {
                    var dataType = shape["dataType"] as string;

                    return new ScalarShape(dataType, pattern, minLength, maxLength, minimum, maximum, exclusiveMinimum, exclusiveMaximum, format, multipleOf,
                        DocumentationMapper.Map(shape["documentation"] as IDictionary<string, object>),
                        XmlSerializerMapper.Map(shape["xmlSerialization"] as IDictionary<string, object>), ExampleMapper.Map(shape["examples"] as object[]),
                shape["name"] as string, shape["displayName"] as string, shape["description"] as string, shape["default"] as string,
                StringEnumerationMapper.Map(shape["values"] as object[]), Map(shape["inherits"] as object[]), linkTargetName);
                }
                else // File
                {
                    var fileTypes = StringEnumerationMapper.Map(shape["fileTypes"] as object[]);

                    return new FileShape(pattern, minLength, maxLength, minimum, maximum, exclusiveMinimum, exclusiveMaximum, format, multipleOf, fileTypes,
                        DocumentationMapper.Map(shape["documentation"] as IDictionary<string, object>),
                        XmlSerializerMapper.Map(shape["xmlSerialization"] as IDictionary<string, object>), ExampleMapper.Map(shape["examples"] as object[]),
                shape["name"] as string, shape["displayName"] as string, shape["description"] as string, shape["default"] as string,
                StringEnumerationMapper.Map(shape["values"] as object[]), Map(shape["inherits"] as object[]), linkTargetName);
                }
            }

            if (shape.ContainsKey("raw") && shape["raw"] != null)
                MapSchema(shape);

            return new AnyShape(DocumentationMapper.Map(shape["documentation"] as IDictionary<string, object>),
                XmlSerializerMapper.Map(shape["xmlSerialization"] as IDictionary<string, object>), ExampleMapper.Map(shape["examples"] as object[]),
                shape["name"] as string, shape["displayName"] as string, shape["description"] as string, shape["default"] as string,
                StringEnumerationMapper.Map(shape["values"] as object[]), Map(shape["inherits"] as object[]), linkTargetName);
        }

        private static string GetLinkTargetName(IDictionary<string, object> shape)
        {
            var linkTarget = shape.ContainsKey("linkTarget") ? shape["linkTarget"] : null;
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