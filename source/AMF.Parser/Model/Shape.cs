using System.Collections.Generic;

namespace AMF.Parser.Model
{
    public class Shape
    {
        /// <summary>
        /// Shape
        /// </summary>
        public Shape(string id, string name, string displayName, string description, Shape @default, IEnumerable<string> values, IEnumerable<Shape> inherits, 
            string linkTargetName)
        {
            Id = id;
            Name = name;
            DisplayName = displayName;
            Description = description;
            Default = @default;
            Values = values;
            Inherits = inherits;
            LinkTargetName = linkTargetName;
        }

        public string Id { get; }
        public string Name { get; }
        public string DisplayName { get; }
        public string Description { get; }
        public Shape Default { get; }
        public IEnumerable<string> Values { get; }
        public IEnumerable<Shape> Inherits { get; }
        public string LinkTargetName { get; }
    }
}