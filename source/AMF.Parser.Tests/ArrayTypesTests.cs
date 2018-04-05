using Microsoft.VisualStudio.TestTools.UnitTesting;
using AMF.Parser;
using System.Linq;
using AMF.Parser.Model;

namespace UnitTestProject1
{
    [TestClass]
    public class ArrayTypesTests
    {
        private AmfModel model;

        [TestInitialize]
        public void Initialize()
        {
            var parser = new AmfParser();
            model = parser.Load("./specs/arrayTypes.raml").Result;
        }

        [TestMethod]
        public void Shapes_count()
        {
            Assert.AreEqual(5, model.Shapes.Count());
        }
    }
}
