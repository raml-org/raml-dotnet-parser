using System.Collections.Generic;

namespace RAML.Parser.Model
{
    public class AmfModel
    {
        public AmfModel(WebApi webApi, IEnumerable<Shape> shapes)
        {
            WebApi = webApi;
            Shapes = shapes;
        }

        public WebApi WebApi { get; }
        public IEnumerable<Shape> Shapes { get; }
    }
}
