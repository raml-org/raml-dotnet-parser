namespace RAML.Parser.Model
{
    public class ParametrizedSecurityScheme
    {
        public ParametrizedSecurityScheme(string name, SecurityScheme securityScheme)
        {
            Name = name;
            SecurityScheme = securityScheme;
        }

        public string Name { get; }
        public SecurityScheme SecurityScheme { get; }
    }
}