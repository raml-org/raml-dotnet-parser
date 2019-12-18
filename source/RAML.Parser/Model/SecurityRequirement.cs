using System.Collections.Generic;

namespace RAML.Parser.Model
{
    public class SecurityRequirement
    {
        public SecurityRequirement(IEnumerable<ParametrizedSecurityScheme> schemes)
        {
            Schemes = schemes;
        }

        public IEnumerable<ParametrizedSecurityScheme> Schemes { get; }
    }
}