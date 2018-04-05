namespace AMF.Parser.Model
{
    public class Parameter
    {
        public Parameter(string name, string description, bool required, string binding, Shape schema)
        {
            Name = name;
            Description = description;
            Required = required;
            Binding = binding;
            Schema = schema;
        }

        public string Name { get; }
        public string Description { get; }
        public bool Required { get; }
        public string Binding { get; }
        public Shape Schema { get; }
    }
}