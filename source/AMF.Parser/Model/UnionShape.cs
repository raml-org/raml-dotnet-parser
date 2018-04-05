using System.Collections.Generic;

namespace AMF.Parser.Model
{
    public class UnionShape : AnyShape
    {
        /// <summary>
        /// Union
        /// </summary>
        public UnionShape(IEnumerable<Shape> anyOf, Documentation documentation, XmlSerializer xmlSerialization, IEnumerable<Example> examples,
            string name, string displayName, string description, string @default, IEnumerable<string> values, IEnumerable<Shape> inherits,
            string linkTargetName)
            : base(documentation, xmlSerialization, examples, name, displayName, description, @default, values, inherits, linkTargetName)
        {
            AnyOf = anyOf;
        }

        // union
        public IEnumerable<Shape> AnyOf { get; }
    }
}