using System.Collections.Generic;

namespace RAML.Parser.Model
{
    public class AmfModel
    {
        public AmfModel(WebApi webApi, IEnumerable<Shape> shapes, bool? validates, IEnumerable<ValidationMessage> messages)
        {
            WebApi = webApi;
            Shapes = shapes;
            Validates = validates;
            ValidationMessages = messages;
        }

        public WebApi WebApi { get; }
        public IEnumerable<Shape> Shapes { get; }
        public bool? Validates { get; }
        public IEnumerable<ValidationMessage> ValidationMessages { get; }
    }
}
