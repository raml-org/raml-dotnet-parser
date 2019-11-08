using Microsoft.VisualStudio.TestTools.UnitTesting;
using RAML.Parser;
using System.Linq;
using RAML.Parser.Model;
using System.Threading.Tasks;

namespace RAML.Parser.Tests
{
    [TestClass]
    public class IncludeTests
    {
        private RamlParser parser = new RamlParser();

        [TestMethod]
        public async Task Should_work_with_traits_in_libs()
        {
            var model = await parser.Load("specs/lib-traits.raml");
            Assert.IsNotNull(model.WebApi.EndPoints.First().Operations.First().Request);
        }

        [TestMethod]
        public async Task Should_work_with_includes()
        {
            var model = await parser.Load("specs/included-files.raml");
            Assert.IsNotNull(model);
        }

        [TestMethod]
        public async Task Should_work_with_relative_includes()
        {
            var model = await parser.Load("specs/relative-include.raml");
            Assert.IsNotNull(model);
        }
    }
}
