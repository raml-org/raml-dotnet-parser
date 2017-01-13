using System;
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

        private string _namespace;
        public new string Namespace
        {
            get
            {
                if (_namespace == null && !string.IsNullOrEmpty(Type) && Type.Contains("."))
                    _namespace = Type.Remove(Type.LastIndexOf(".", StringComparison.Ordinal));
                return _namespace;
            }
            set
            {
                _namespace = value;
            }
        }
    }
}