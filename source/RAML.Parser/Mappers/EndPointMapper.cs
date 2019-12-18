using System.Collections.Generic;
using RAML.Parser.Model;
using System.Linq;

namespace RAML.Parser.Mappers
{
    internal static class EndPointMapper
    {
        internal static IEnumerable<EndPoint> Map(object[] endPoints)
        {
            if(endPoints == null)
                return new List<EndPoint>();

            return endPoints.Select(e => Map(e as IDictionary<string, object>)).ToArray();
        }

        private static EndPoint Map(IDictionary<string, object> endpoint)
        {
            if (endpoint == null)
                return null;

            return new EndPoint(endpoint["name"] as string, endpoint["description"] as string, endpoint["path"] as string, 
                OperationMapper.Map(endpoint["operations"] as object[]), ParameterMapper.Map(endpoint["parameters"] as object[]), 
                SecurityRequirementMapper.Map(endpoint["security"] as object[]));
        }
    }
}