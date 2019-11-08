﻿using System.Collections.Generic;

namespace RAML.Parser.Model
{
    public class FileShape : AnyShape
    {
        /// <summary>
        /// File
        /// </summary>
        public FileShape(string pattern, int? minLength, int? maxLength, string minimum, string maximum, string exclusiveMinimum, string exclusiveMaximum,
            string format, int? multipleOf, IEnumerable<string> fileTypes, Documentation documentation, XmlSerializer xmlSerialization,
            IEnumerable<Example> examples, string id,
            string name, string displayName, string description, Shape @default, IEnumerable<string> values, IEnumerable<Shape> inherits
            , string linkTargetName)
            : base(documentation, xmlSerialization, examples, id, name, displayName, description, @default, values, inherits, linkTargetName)
        {
            Pattern = pattern;
            MinLength = minLength;
            MaxLength = maxLength;
            Minimum = minimum;
            Maximum = maximum;
            ExclusiveMinimum = exclusiveMinimum;
            ExclusiveMaximum = exclusiveMaximum;
            Format = format;
            MultipleOf = multipleOf;
            FileTypes = fileTypes;
        }

        // file
        public IEnumerable<string> FileTypes { get; }
        public string Pattern { get; }
        public int? MinLength { get; }
        public int? MaxLength { get; }
        public string Minimum { get; }
        public string Maximum { get; }
        public string ExclusiveMinimum { get; }
        public string ExclusiveMaximum { get; }
        public string Format { get; }
        public int? MultipleOf { get; }
    }
}