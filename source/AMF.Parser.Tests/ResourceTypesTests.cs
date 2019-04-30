using Microsoft.VisualStudio.TestTools.UnitTesting;
using AMF.Parser;
using System.Linq;
using AMF.Parser.Model;
using System.Threading.Tasks;

namespace UnitTestProject1
{
    [TestClass]
    public class ResourceTypeTests
    {
        private AmfParser parser = new AmfParser();

        [TestMethod]
        public async Task Should_work_with_resource_types()
        {
            var model = await parser.Load("specs/resource-types.raml");
            Assert.AreEqual(2, model.WebApi.EndPoints.Count());
        }
    }
}
