namespace AMF.Parser.Model
{
    public class License
    {
        public License(string url, string name)
        {
            Url = url;
            Name = name;
        }

        public string Url { get; }
        public string Name { get; }
    }
}