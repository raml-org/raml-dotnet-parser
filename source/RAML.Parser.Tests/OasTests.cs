using Microsoft.VisualStudio.TestTools.UnitTesting;
using RAML.Parser;
using System.Linq;
using RAML.Parser.Model;

namespace RAML.Parser.Tests
{
    [TestClass]
    public class OasTests
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
            var model = parser.Load("./specs/oas/yaml/talkvotes.oas2.yaml").Result;
            Assert.AreEqual(2, model.WebApi.EndPoints.Count());
        }

        [TestMethod]
        public void Uber_name_check()
        {
            var model = parser.Load("./specs/oas/json/uber.json").Result;
            Assert.AreEqual("Uber API", model.WebApi.Name);
        }
    }
}
