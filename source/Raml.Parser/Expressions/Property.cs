using System.Collections.Generic;

namespace Raml.Parser.Expressions
{
    public class Property : Parameter
    {
        public object Facets { get; set; }

        // number
        public string Format { get; set; }
        public int? MultipleOf { get; set; }

        // file
        public ICollection<string> FileTypes { get; set; }
    }
}