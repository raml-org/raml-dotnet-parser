using System.Collections.Generic;

namespace AMF.Parser.Model
{
    public class Shape
    {
        /// <summary>
        /// Shape
        /// </summary>
        public Shape(string name, string displayName, string description, string @default, IEnumerable<string> values, IEnumerable<Shape> inherits, 
            string linkTargetName)
        {
            Name = name;
            DisplayName = displayName;
            Description = description;
            Default = @default;
            Values = values;
            Inherits = inherits;
            LinkTargetName = linkTargetName;
        }

        // shape
        public string Name { get; }
        public string DisplayName { get; }
        public string Description { get; }
        public string Default { get; }
        public IEnumerable<string> Values { get; }
        public IEnumerable<Shape> Inherits { get; }
        public string LinkTargetName { get; }
    }
}