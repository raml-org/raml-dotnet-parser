namespace AMF.Parser.Model
{
    public class Documentation
    {
        public Documentation(string url, string description, string title)
        {
            Url = url;
            Description = description;
            Title = title;
        }

        public string Url { get; }
        public string Description { get; }
        public string Title { get; }
    }
}