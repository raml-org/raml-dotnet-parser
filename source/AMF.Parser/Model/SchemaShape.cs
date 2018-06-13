using System.Collections.Generic;

namespace AMF.Parser.Model
{
    public class SchemaShape : AnyShape
    {
        /// <summary>
        /// Schema
        /// </summary>
        public SchemaShape(string mediaType, string raw, Documentation documentation, XmlSerializer xmlSerialization, IEnumerable<Example> examples,
            string id, string name, string displayName, string description, Shape @default, IEnumerable<string> values, IEnumerable<Shape> inherits,
            string linkTargetName)
            : base(documentation, xmlSerialization, examples, id, name, displayName, description, @default, values, inherits, linkTargetName)
        {
            MediaType = mediaType;
            Raw = raw;
        }

        public string MediaType { get; }
        public string Raw { get; }
    }
}