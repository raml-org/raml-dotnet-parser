using Microsoft.VisualStudio.TestTools.UnitTesting;
using AMF.Parser;
using System.Linq;
using AMF.Parser.Model;

namespace UnitTestProject1
{
    [TestClass]
    public class ApiWithExamplesTests
    {
        private AmfModel model;

        [TestInitialize]
        public void Initialize()
        {
            var parser = new AmfParser();
            model = parser.Load("./specs/oas/yaml/api-with-examples.yaml").Result;
        }

        [TestMethod]
        public void Endpoints_count()
        {
            Assert.AreEqual(2, model.WebApi.EndPoints.Count());
        }

        [TestMethod]
        public void Name_check()
        {
            Assert.AreEqual("Simple API overview", model.WebApi.Name);
        }

        [TestMethod]
        public void Version_check()
        {
            Assert.AreEqual("v2", model.WebApi.Version);
        }

        [TestMethod]
        public void Get_root_response()
        {
            var get = model.WebApi.EndPoints.First(e => e.Path == "/").Operations.First(o => o.Method == "get");
            Assert.AreEqual("List API versions", get.Summary);
            Assert.AreEqual("listVersionsv2", get.Name);
            var resp = get.Responses.First();
            Assert.AreEqual("200", resp.StatusCode);
            Assert.AreEqual("200 300 response", resp.Description);
            //Assert.AreEqual(1, resp.Examples.Count());
            //Assert.AreEqual("application/json", resp.Examples.First().MediaType);
        }
    }
}
