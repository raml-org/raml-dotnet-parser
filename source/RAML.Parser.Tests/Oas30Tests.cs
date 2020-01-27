using Microsoft.VisualStudio.TestTools.UnitTesting;
using RAML.Parser;
using System.Linq;
using RAML.Parser.Model;

namespace RAML.Parser.Tests
{
    [TestClass]
    public class Oas30Tests
    {
        private RamlParser parser;

        [TestInitialize]
        public void Initialize()
        {
            parser = new RamlParser();
        }

        [TestMethod]
        public void Endpoints_count()
        {
            var model = parser.Load("./specs/oas/3.0/api-with-examples.yaml").Result;
            Assert.AreEqual(2, model.WebApi.EndPoints.Count());
        }

        [TestMethod]
        public void petstore_name_check()
        {
            var model = parser.Load("./specs/oas/3.0/petstore.yaml").Result;
            Assert.AreEqual("Swagger Petstore", model.WebApi.Name);
        }

        [TestMethod]
        public void petstore_expanded_check()
        {
            var model = parser.Load("./specs/oas/3.0/petstore-expanded.yaml").Result;
            Assert.AreEqual("Swagger Petstore", model.WebApi.Name);
        }

    }
}
