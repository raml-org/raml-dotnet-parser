using System.Collections.Generic;
using RAML.Parser.Model;
using System.Linq;

namespace RAML.Parser.Mappers
{
    internal class PayloadMapper
    {
        internal static IEnumerable<Payload> Map(object[] payloads)
        {
            if (payloads == null)
                return new Payload[0];

            return payloads.Select(p => Map(p as IDictionary<string, object>)).ToArray();
        }

        private static Payload Map(IDictionary<string, object> payload)
        {
            if (payload == null)
                return null;

            return new Payload(payload["mediaType"] as string, ShapeMapper.Map(payload["schema"] as IDictionary<string, object>));
        }
    }
}