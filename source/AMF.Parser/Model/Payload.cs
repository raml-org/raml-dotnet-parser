namespace AMF.Parser.Model
{
    public class Payload
    {
        public Payload(string mediaType, Shape schema)
        {
            MediaType = mediaType;
            Schema = schema;
        }

        public string MediaType { get; }
        public Shape Schema { get; }
    }
}