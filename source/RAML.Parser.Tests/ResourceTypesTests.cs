using Microsoft.VisualStudio.TestTools.UnitTesting;
using RAML.Parser;
using System.Linq;
using RAML.Parser.Model;
using System.Threading.Tasks;

namespace RAML.Parser.Tests
{
    [TestClass]
    public class ResourceTypeTests
    {
        private RamlParser parser = new RamlParser();

        [TestMethod]
        public async Task Should_work_with_resource_types()
        {
            var model = await parser.Load("specs/resource-types.raml");
            Assert.AreEqual(2, model.WebApi.EndPoints.Count());
        }
    }
}
