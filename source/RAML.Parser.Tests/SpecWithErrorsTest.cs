using Microsoft.VisualStudio.TestTools.UnitTesting;
using RAML.Parser;
using System.Linq;
using RAML.Parser.Model;
using System;

namespace RAML.Parser.Tests
{
    [TestClass]
    public class SpecWithErrorsTest
    {
        [TestMethod]
        public void external_docs_pet_check()
        {
            var parser = new RamlParser();
            var model = parser.Load("./specs/oas/yaml/petstore-with-external-docs.yaml").GetAwaiter().GetResult();
            Assert.IsNotNull(model);
        }
    }
}
