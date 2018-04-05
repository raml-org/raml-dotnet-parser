using System.Collections.Generic;

namespace AMF.Parser.Model
{
    public class AnyShape : Shape
    {
        /// <summary>
        /// AnyShape
        /// </summary>
        public AnyShape(Documentation documentation, XmlSerializer xmlSerialization, IEnumerable<Example> examples,
            string name, string displayName, string description, string @default, IEnumerable<string> values, IEnumerable<Shape> inherits,
            string linkTargetName)
            : base(name, displayName, description, @default, values, inherits, linkTargetName)
        {
            Documentation = documentation;
            XmlSerialization = xmlSerialization;
            Examples = examples;
        }
        // any
        public Documentation Documentation { get; }
        public XmlSerializer XmlSerialization { get; }
        public IEnumerable<Example> Examples { get; }

    }
}