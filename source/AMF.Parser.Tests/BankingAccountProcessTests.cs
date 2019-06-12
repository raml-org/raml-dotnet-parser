using Microsoft.VisualStudio.TestTools.UnitTesting;
using AMF.Parser;
using System.Linq;
using AMF.Parser.Model;

namespace UnitTestProject1
{
    [TestClass]
    public class BankingAccountProcessTests
    {
        private AmfModel model;

        [TestInitialize]
        public void Initialize()
        {
            var parser = new AmfParser();
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
