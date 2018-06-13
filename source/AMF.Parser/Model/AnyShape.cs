using System.Collections.Generic;

namespace AMF.Parser.Model
{
    public class AnyShape : Shape
    {
        /// <summary>
        /// AnyShape
        /// </summary>
        public AnyShape(Documentation documentation, XmlSerializer xmlSerialization, IEnumerable<Example> examples, string id,
            string name, string displayName, string description, Shape @default, IEnumerable<string> values, IEnumerable<Shape> inherits,
            string linkTargetName)
            : base(id, name, displayName, description, @default, values, inherits, linkTargetName)
        {
            Documentation = documentation;
            XmlSerialization = xmlSerialization;
            Examples = examples;
        }
        
        public Documentation Documentation { get; }
        public XmlSerializer XmlSerialization { get; }
        public IEnumerable<Example> Examples { get; }

    }
}