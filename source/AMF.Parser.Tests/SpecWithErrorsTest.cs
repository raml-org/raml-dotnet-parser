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
        [ExpectedException(typeof(AggregateException))]
        public void error_spec_check()
        {
            var parser = new AmfParser();
            Assert.ThrowsException<AggregateException>(() =>
            {
                var model = parser.Load("./specs/oas/yaml/petstore-with-external-docs.yaml").Result;
            });
        }
    }
}
