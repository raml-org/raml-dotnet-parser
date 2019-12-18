using RAML.Parser.Model;
using RAML.Parser.Utils;
using System;
using System.Collections.Generic;
using System.Linq;

namespace RAML.Parser.Mappers
{
    internal class FlowMapper
    {
        internal static IEnumerable<Flow> Map(IEnumerable<object> flows)
        {
            if (flows == null)
                return new Flow[0];

            return flows.Select(m => Map(m as IDictionary<string, object>));
        }

        private static Flow Map(IDictionary<string, object> flow)
        {
            if (flow == null)
                return null;

            return new Flow(ParameterMapperUtils.Map<string>(flow, "authorizationUri"), ParameterMapperUtils.Map<string>(flow, "accessTokenUri"),
                ParameterMapperUtils.Map<string>(flow, "flow"), ScopeMapper.Map(ParameterMapperUtils.Map<object[]>(flow, "scopes")));
        }
    }
}