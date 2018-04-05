using Microsoft.VisualStudio.TestTools.UnitTesting;
using AMF.Parser;
using System.Linq;
using AMF.Parser.Model;

namespace UnitTestProject1
{
    [TestClass]
    public class TypeExpressnsTests
    {
        private AmfModel model;

        [TestInitialize]
        public void Initialize()
        {
            var parser = new AmfParser();
            model = parser.Load("./specs/typeexpressions.raml").Result;
        }

        [TestMethod]
        public void checks()
        {
            Assert.AreEqual(1, model.Shapes.Count());
            Assert.AreEqual(1, model.WebApi.EndPoints.Count());
            Assert.AreEqual(3, model.WebApi.EndPoints.First().Operations.Count());
        }
    }
}
