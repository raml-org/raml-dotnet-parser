namespace RAML.Parser
{
    public class ValidationMessage
    {
        public ValidationMessage(string message, string level, string location)
        {
            Message = message;
            Level = level;
            Location = location;
        }

        public string Message { get; }
        public string Level { get; }
        public string Location { get; }
    }
}