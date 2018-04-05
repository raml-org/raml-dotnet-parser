using System.Collections.Generic;

namespace AMF.Parser.Model
{
    public class EndPoint
    {
        public EndPoint(string name, string description, string path, IEnumerable<Operation> operations, IEnumerable<Parameter> parameters, IEnumerable<ParametrizedSecurityScheme> security)
        {
            Name = name;
            Description = description;
            Path = path;
            Operations = operations;
            Parameters = parameters;
            Security = security;
        }

        public string Name { get; }
        public string Description { get; }
        public string Path { get; }
        public IEnumerable<Operation> Operations { get; }
        public IEnumerable<Parameter> Parameters { get; }
        public IEnumerable<ParametrizedSecurityScheme> Security { get; }
    }
}