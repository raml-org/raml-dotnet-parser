namespace AMF.Parser.Model
{
    public class XmlSerializer
    {
        public XmlSerializer(bool attribute, bool wrapped, string name, string @namespace, string prefix)
        {
            Attribute = attribute;
            Wrapped = wrapped;
            Name = name;
            Namespace = @namespace;
            Prefix = prefix;
        }

        public bool Attribute { get; }
        public bool Wrapped { get; }
        public string Name { get; }
        public string Namespace { get; }
        public string Prefix { get; }
    }
}