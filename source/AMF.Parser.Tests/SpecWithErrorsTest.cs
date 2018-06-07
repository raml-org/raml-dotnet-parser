using Microsoft.VisualStudio.TestTools.UnitTesting;
using AMF.Parser;
using System.Linq;
using AMF.Parser.Model;
using System;

namespace UnitTestProject1
{
    [TestClass]
    public class SpecWithErrorsTest
    {
        [TestMethod]
        public void external_docs_pet_check()
        {
            var parser = new AmfParser();
            var model = parser.Load("./specs/oas/yaml/petstore-with-external-docs.yaml").GetAwaiter().GetResult();
            Assert.IsNotNull(model);
        }
    }
}
