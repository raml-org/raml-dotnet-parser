﻿using RAML.Parser.Model;
using System.Collections.Generic;
using System.Linq;
using RAML.Parser.Utils;

namespace RAML.Parser.Mappers
{
    internal class PropertyShapeMapper
    {
        internal static IEnumerable<PropertyShape> Map(object[] propertyShape)
        {
            if (propertyShape == null)
                return new PropertyShape[0];

            return propertyShape.Select(p => Map(p as IDictionary<string, object>)).ToArray();
        }

        private static PropertyShape Map(IDictionary<string, object> prop)
        {
            if (prop == null)
                return null;

            return new PropertyShape(prop["path"] as string, ShapeMapper.Map(prop["range"] as IDictionary<string, object>), 
                prop["inheritanceProvenance"] as string, ParameterMapperUtils.MapInt(prop, "minCount"), ParameterMapperUtils.MapInt(prop, "maxCount"));
        }
    }
}