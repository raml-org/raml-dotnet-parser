using AMF.Parser.Model;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AMF.Parser.Mappers
{
    internal class OperationMapper
    {
        internal static IEnumerable<Operation> Map(object[] operations)
        {
            if (operations == null)
                return new Operation[0];

            return operations.Select(o => Map(o as IDictionary<string, object>)).ToArray();
        }

        private static Operation Map(IDictionary<string, object> operation)
        {
            if (operation == null)
                return null;

            return new Operation(operation["method"] as string, operation["name"] as string, operation["description"] as string,
                operation["deprecated"] == null ? false : Convert.ToBoolean(operation["deprecated"]), operation["summary"] as string,
                DocumentationMapper.Map(operation["documentation"] as IDictionary<string, object>),
                StringEnumerationMapper.Map(operation["schemes"] as object[]), StringEnumerationMapper.Map(operation["accepts"] as object[]),
                StringEnumerationMapper.Map(operation["contentType"] as object[]), RequestMapper.Map(operation["request"] as IDictionary<string, object>),
                ResponseMapper.Map(operation["responses"] as object[]), SecuritySchemeMapper.Map(operation["security"] as object[]));
        }
    }
}