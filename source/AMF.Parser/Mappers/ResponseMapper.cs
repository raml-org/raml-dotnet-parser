using System.Collections.Generic;
using AMF.Parser.Model;
using System.Linq;

namespace AMF.Parser.Mappers
{
    internal class ResponseMapper
    {
        internal static IEnumerable<Response> Map(object[] responses)
        {
            if (responses == null)
                return new Response[0];

            return responses.Select(r => Map(r as IDictionary<string, object>)).ToArray();
        }

        private static Response Map(IDictionary<string, object> response)
        {
            if (response == null)
                return null;

            return new Response(response["name"] as string, response["description"] as string, response["statusCode"] as string,
                ParameterMapper.Map(response["headers"] as object[]), PayloadMapper.Map(response["payloads"] as object[]), 
                ExampleMapper.Map(response["examples"] as object[]));
        }
    }
}