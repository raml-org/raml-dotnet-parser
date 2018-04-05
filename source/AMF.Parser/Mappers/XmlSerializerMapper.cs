using AMF.Parser.Model;
using System;
using System.Collections.Generic;

namespace AMF.Parser.Mappers
{
    internal class XmlSerializerMapper
    {
        internal static XmlSerializer Map(IDictionary<string, object> xmlSerializer)
        {
            if (xmlSerializer == null)
                return null;

            return new XmlSerializer(xmlSerializer["attribute"] == null ? false : Convert.ToBoolean(xmlSerializer["attribute"]),
                xmlSerializer["wrapped"] == null ? false : Convert.ToBoolean(xmlSerializer["wrapped"]), xmlSerializer["name"] as string, 
                xmlSerializer["namespace"] as string, xmlSerializer["prefix"] as string);
        }
    }
}