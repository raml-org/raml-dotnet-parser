using System.Collections.Generic;

namespace AMF.Parser.Model
{
    public class NodeShape : AnyShape
    {
        /// <summary>
        /// Node
        /// </summary>
        public NodeShape(int minProperties, int maxProperties, bool closed, string discriminator, string discriminatorValue, bool readOnly,
            IEnumerable<PropertyShape> properties, IEnumerable<PropertyDependency> dependencies, Documentation documentation,
            XmlSerializer xmlSerialization, IEnumerable<Example> examples,
            string name, string displayName, string description, string @default, IEnumerable<string> values, IEnumerable<Shape> inherits,
            string linkTargetName)
            : base(documentation, xmlSerialization, examples, name, displayName, description, @default, values, inherits, linkTargetName)
        {
            MinProperties = minProperties;
            MaxProperties = maxProperties;
            Closed = closed;
            Discriminator = discriminator;
            DiscriminatorValue = discriminatorValue;
            ReadOnly = readOnly;
            Properties = properties;
            Dependencies = dependencies;
        }

        // node
        public int MinProperties { get; }
        public int MaxProperties { get; }
        public bool Closed { get; }
        public string Discriminator { get; }
        public string DiscriminatorValue { get; }
        public bool ReadOnly { get; }
        public IEnumerable<PropertyShape> Properties { get; }
        public IEnumerable<PropertyDependency> Dependencies { get; }
    }
}