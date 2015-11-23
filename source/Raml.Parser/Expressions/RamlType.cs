using System.Collections.Generic;

namespace Raml.Parser.Expressions
{
    public class RamlType
    {
        public string Name { get; set; }
        public TypeKind Type { get; set; }
        public IDictionary<string,Parameter> Properties { get; set; }
        public string Example { get; set; }
    }
}