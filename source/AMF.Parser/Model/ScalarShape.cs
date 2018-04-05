using System.Collections.Generic;

namespace AMF.Parser.Model
{
    public class ScalarShape : AnyShape
    {
        /// <summary>
        /// Scalar
        /// </summary>
        public ScalarShape(string dataType, string pattern, int minLength, int maxLength, string minimum, string maximum, string exclusiveMinimum,
            string exclusiveMaximum, string format, int multipleOf, Documentation documentation, XmlSerializer xmlSerialization,
            IEnumerable<Example> examples,
            string name, string displayName, string description, string @default, IEnumerable<string> values, IEnumerable<Shape> inherits,
            string linkTargetName)
            : base(documentation, xmlSerialization, examples, name, displayName, description, @default, values, inherits, linkTargetName)
        {
            DataType = dataType;
            Pattern = pattern;
            MinLength = minLength;
            MaxLength = maxLength;
            Minimum = minimum;
            Maximum = maximum;
            ExclusiveMinimum = exclusiveMinimum;
            ExclusiveMaximum = exclusiveMaximum;
            Format = format;
            MultipleOf = multipleOf;
        }

        // scalar
        public string DataType { get; }
        public string Pattern { get; }
        public int MinLength { get; }
        public int MaxLength { get; }
        public string Minimum { get; }
        public string Maximum { get; }
        public string ExclusiveMinimum { get; }
        public string ExclusiveMaximum { get; }
        public string Format { get; }
        public int MultipleOf { get; }
    }
}