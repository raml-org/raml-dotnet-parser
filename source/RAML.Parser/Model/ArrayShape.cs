﻿using System.Collections.Generic;

namespace RAML.Parser.Model
{
    public class ArrayShape : AnyShape
    {
        /// <summary>
        /// ArrayShape
        /// </summary>
        public ArrayShape(Shape items, int? minItems, int? maxItems, bool? uniqueItems,  
            Documentation documentation, XmlSerializer xmlSerialization, IEnumerable<Example> examples, string id,
            string name, string displayName, string description, Shape @default, IEnumerable<string> values, IEnumerable<Shape> inherits,
            string linkTargetName)
            : base(documentation, xmlSerialization, examples, id, name, displayName, description, @default, values, inherits, linkTargetName)
        {
            Items = items;
            MinItems = minItems;
            MaxItems = maxItems;
            UniqueItems = uniqueItems;
        }

        // array
        public int? MinItems { get; }
        public int? MaxItems { get; }
        public bool? UniqueItems { get; }
        public Shape Items { get; }
    }
}