using System.IO;
using System.Linq;
using System.Threading.Tasks;
using NUnit.Framework;
using Raml.Parser.Expressions;

namespace Raml.Parser.Tests
{
    public class TypesTests
    {
        private static RamlParser parser;

        [Test]
        public async Task ShouldParseMapTypes()
        {
            var raml = await Parse("specifications/maps.raml");

            Assert.AreEqual(4, raml.Types.Count);
            Assert.AreEqual("object", raml.Types["Person"].Type);
        }

        [Test]
        public async Task ShouldParseComplexTypes()
        {
            var raml = await Parse("specifications/complextypes.raml");

            Assert.AreEqual(2, raml.Types["Movie"].Object.Properties["director"].Object.Properties.Count);
            
            Assert.AreEqual("Movie[]", raml.Types["Movies"].Type);
            Assert.IsNotNull(raml.Types["Movies"].Array);

            Assert.AreEqual(2, raml.Types["SomeArray"].Array.Items.Object.Properties.Count);
            Assert.AreEqual("integer", raml.Types["SomeArray"].Array.Items.Object.Properties["prop1"].Scalar.Type);
        }

        [Test]
        public async Task ShouldParseTypes_Movies1()
        {
            var raml = await Parse("specifications/movietype.raml");

            Assert.AreEqual(1, raml.Types.Count);
            Assert.AreEqual("object", raml.Types["Movie"].Type);
        }

        [Test]
        public async Task ShouldHandleTypeProperties_Movies1()
        {
            var raml = await Parse("specifications/movietype.raml");

            Assert.AreEqual(255, raml.Types["Movie"].Object.Properties.First(p => p.Key == "name").Value.Scalar.MaxLength);
            Assert.AreEqual(1, raml.Types["Movie"].Object.Properties.First(p => p.Key == "duration").Value.Scalar.Minimum);
            Assert.AreEqual(false, raml.Types["Movie"].Object.Properties.First(p => p.Key == "duration").Value.Required);
            Assert.AreEqual(9, raml.Types["Movie"].Object.Properties.Count());
        }

        [Test]
        public async Task ShouldHandleTypeExpressions()
        {
            var raml = await Parse("specifications/typeexpressions.raml");

            Assert.AreEqual("(string | Movie)[]", raml.Resources.First().Methods.First(m => m.Verb == "get").Responses.First().Body.First().Value.Type);
            Assert.AreEqual("string | Movie", raml.Resources.First().Methods.First(m => m.Verb == "post").Body.First().Value.Schema);
            Assert.AreEqual("Movie", raml.Resources.First().Methods.First(m => m.Verb == "put").Body.First().Value.Type);
        }

        [Test]
        public async Task ShouldHandleCustomScalars()
        {
            var raml = await Parse("specifications/customscalar.raml");

            Assert.AreEqual(2, raml.Types.Count);
        }

        private static async Task<RamlDocument> Parse(string filePath)
        {
            parser = new RamlParser();
            var fi = new FileInfo(filePath);
            var raml = await parser.LoadAsync(fi.FullName);
            return raml;
        }

    }
}