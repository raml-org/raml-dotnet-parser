using System.Collections.Generic;

namespace RAML.Parser.Model
{
    public class UnionShape : AnyShape
    {
        /// <summary>
        /// Union
        /// </summary>
        public UnionShape(IEnumerable<Shape> anyOf, Documentation documentation, XmlSerializer xmlSerialization, IEnumerable<Example> examples,
            string id, string name, string displayName, string description, Shape @default, IEnumerable<string> values, IEnumerable<Shape> inherits,
            string linkTargetName)
            : base(documentation, xmlSerialization, examples, id, name, displayName, description, @default, values, inherits, linkTargetName)
        {
            AnyOf = anyOf;
        }

        // union
        public IEnumerable<Shape> AnyOf { get; }
    }
}