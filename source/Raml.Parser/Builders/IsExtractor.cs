using System.Collections.Generic;
using System.Linq;

namespace Raml.Parser.Builders
{
    public class IsExtractor
    {
        public static IEnumerable<string> Get(IDictionary<string, object> dynamicRaml)
        {
            if (!dynamicRaml.ContainsKey("is"))
                return null;

            var objectsAsArray = dynamicRaml["is"] as object[];

            if (objectsAsArray != null)
            {
                var ret = new List<string>();
                foreach (var obj in objectsAsArray)
                {
                    var isDic = obj as IDictionary<string, object>;
                    if (isDic != null)
                    {
                        ret.Add(isDic.Keys.First());
                        continue;
                    }

                    var @is = obj as string;
                    if (@is != null)
                        ret.Add(@is);
                }
                return ret;
            }

            var objectAsString = dynamicRaml["is"] as string;
            return new[] { objectAsString };
        }
    }
}