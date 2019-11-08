using Microsoft.VisualStudio.TestTools.UnitTesting;
using RAML.Parser;
using System.Linq;
using RAML.Parser.Model;

namespace RAML.Parser.Tests
{
    [TestClass]
    public class BankingAccountProcessTests
    {
        private AmfModel model;

        [TestInitialize]
        public void Initialize()
        {
            var parser = new RamlParser();
            model = parser.Load("./specs/account-aggregation-process-api-2.0.0-raml/banking_accounts_process_api.raml").Result;
        }

        [TestMethod]
        public void Endpoints_should_be_2()
        {
            Assert.AreEqual(2, model.WebApi.EndPoints.Count());
        }

        [TestMethod]
        public void should_include_shapes_in_uses()
        {
            Assert.AreEqual(39, model.Shapes.Count());
        }

    }
}
