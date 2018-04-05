namespace AMF.Parser.Model
{
    public class Organization
    {
        public Organization(string url, string name, string email)
        {
            Url = url;
            Name = name;
            Email = email;
        }

        public string Url { get; }
        public string Name { get; }
        public string Email { get; }
    }
}