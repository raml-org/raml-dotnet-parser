using System.Collections.Generic;

namespace AMF.Parser.Model
{
    public class SchemaShape : AnyShape
    {
        /// <summary>
        /// Schema
        /// </summary>
        public SchemaShape(string mediaType, string raw, Documentation documentation, XmlSerializer xmlSerialization, IEnumerable<Example> examples,
            string name, string displayName, string description, string @default, IEnumerable<string> values, IEnumerable<Shape> inherits,
            string linkTargetName)
            : base(documentation, xmlSerialization, examples, name, displayName, description, @default, values, inherits, linkTargetName)
        {
            MediaType = mediaType;
            Raw = raw;
        }

        // Schema
        public string MediaType { get; }
        public string Raw { get; }
    }
}