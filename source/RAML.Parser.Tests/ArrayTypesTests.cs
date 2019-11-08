using Microsoft.VisualStudio.TestTools.UnitTesting;
using RAML.Parser;
using System.Linq;
using RAML.Parser.Model;

namespace RAML.Parser.Tests
{
    [TestClass]
    public class ArrayTypesTests
    {
        private AmfModel model;

        [TestInitialize]
        public void Initialize()
        {
            var parser = new RamlParser();
            model = parser.Load("./specs/arrayTypes.raml").Result;
        }

        [TestMethod]
        public void Shapes_count()
        {
            Assert.AreEqual(5, model.Shapes.Count());
        }
    }
}
