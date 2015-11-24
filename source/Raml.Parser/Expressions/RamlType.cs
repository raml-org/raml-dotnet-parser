using System.Collections.Generic;

namespace Raml.Parser.Expressions
{
    public class RamlType
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public IDictionary<string,Parameter> Properties { get; set; }
        public string Example { get; set; }

        public ICollection<string> Examples { get; set; }

        public string Xml { get; set; }

        public string Schema { get; set; }

        public string DisplayName { get; set; }

        public string Description { get; set; }

        // Object
        public int MinProperties { get; set; }

        public int MaxProperties { get; set; }

        public object AdditionalProperties { get; set; }

        public object PatternProperties { get; set; }

        public object Discriminator { get; set; }

        public string DiscriminatorValue { get; set; }

        // Array
        public ICollection<RamlType> Items { get; set; } // TODO check

        public bool UniqueItems { get; set; }

        public int MinItems { get; set; }

        public int MaxItems { get; set; }
        public IDictionary<string, object> Facets { get; set; }
        public IDictionary<string, object> OtherProperties { get; set; }
    }
}