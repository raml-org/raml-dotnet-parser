namespace AMF.Parser.Model
{
    public class Example
    {
        public Example(string name, string displayName, string description, string value, bool strict, string mediaType)
        {
            Name = name;
            DisplayName = displayName;
            Description = description;
            Value = value;
            Strict = strict;
            MediaType = mediaType;
        }

        public string Name { get; }
        public string DisplayName { get; }
        public string Description { get; }
        public string Value { get; }
        public bool Strict { get; }
        public string MediaType { get; }
    }
}