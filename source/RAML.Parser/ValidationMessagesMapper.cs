using System;
using System.Collections.Generic;

namespace RAML.Parser
{
    internal class ValidationMessagesMapper
    {
        internal static IEnumerable<ValidationMessage> Map(IEnumerable<object> messages)
        {
            var list = new List<ValidationMessage>();
            foreach(var msg in messages)
            {
                var dic = msg as IDictionary<string, object>;
                list.Add(new ValidationMessage(dic["message"] as string, dic["level"] as string, dic["location"] as string));
            }
            return list;
        }
    }
}