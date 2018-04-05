namespace AMF.Parser.Model
{
    public class PropertyShape
    {
        public PropertyShape(string path, Shape range, int minCount, int maxCount)
        {
            Path = path;
            Range = range;
            MinCount = minCount;
            MaxCount = maxCount;
        }

        public string Path { get; }
        public Shape Range { get; }
        public int MinCount { get; }
        public int MaxCount { get; }
        public bool Required { get { return MinCount > 0; } }
    }
}