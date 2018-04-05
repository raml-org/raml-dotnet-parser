namespace AMF.Parser.Model
{
    public class ParametrizedSecurityScheme
    {
        public ParametrizedSecurityScheme(string name, SecurityScheme securityScheme, Settings settings)
        {
            Name = name;
            SecurityScheme = securityScheme;
            Settings = settings;
        }

        public string Name { get; }
        public SecurityScheme SecurityScheme { get; }
        public Settings Settings { get; }
    }
}