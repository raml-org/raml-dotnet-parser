namespace AMF.Parser.Model
{
    public class PropertyShape
    {
        public PropertyShape(string path, Shape range, string inheritanceProvenance, int minCount, int? maxCount)
        {
            Path = path;
            Range = range;
            InheritanceProvenance = inheritanceProvenance;
            MinCount = minCount;
            MaxCount = maxCount;
        }

        public string Path { get; }
        public Shape Range { get; }
        public string InheritanceProvenance { get; }
        public int? MinCount { get; }
        public int? MaxCount { get; }
        public bool Required { get { return MinCount != null && MinCount > 0; } }
    }
}