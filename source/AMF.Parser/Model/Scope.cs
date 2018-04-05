namespace AMF.Parser.Model
{
    public class Scope
    {
        public Scope(string name, string description)
        {
            Name = name;
            Description = description;
        }

        public string Name { get; }
        public string Description { get; }
    }
}