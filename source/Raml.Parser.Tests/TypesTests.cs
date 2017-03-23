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

        [Test, Ignore("Maps seems to be no longer part of the spec...")]
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
        public async Task ShouldParseAsRequiredByDefault()
        {
            var raml = await Parse("specifications/movietype.raml");
            Assert.AreEqual(false, raml.Types["Movie"].Object.Properties.First(p => p.Key == "storyline").Value.Required);
            Assert.AreEqual(false, raml.Types["Movie"].Object.Properties.First(p => p.Key == "rented").Value.Required);
            Assert.AreEqual(true, raml.Types["Movie"].Object.Properties.First(p => p.Key == "genre").Value.Required);
            Assert.AreEqual(true, raml.Types["Movie"].Object.Properties.First(p => p.Key == "cast").Value.Required);
            Assert.AreEqual(true, raml.Types["Movie"].Object.Properties.First(p => p.Key == "name").Value.Required);
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

            Assert.AreEqual("Movie[]", raml.Resources.First().Methods.First(m => m.Verb == "get").Responses.First().Body.First().Value.Type);
            Assert.AreEqual("string | Movie", raml.Resources.First().Methods.First(m => m.Verb == "put").Body.First().Value.Type);
            Assert.AreEqual("(string | Movie)[]", raml.Resources.First().Methods.First(m => m.Verb == "post").Body.First().Value.Schema);
        }

        [Test]
        public async Task ShouldHandleCustomScalars()
        {
            var raml = await Parse("specifications/customscalar.raml");

            Assert.AreEqual(2, raml.Types.Count);
        }

        [Test]
        public async Task ShouldParseNumberFormats()
        {
            var raml = await Parse("specifications/numbers.raml");
            Assert.AreEqual("long", raml.Types["sample"].Object.Properties.First(p => p.Key == "longprop").Value.Scalar.Format);
            Assert.AreEqual("int64", raml.Types["sample"].Object.Properties.First(p => p.Key == "int64prop").Value.Scalar.Format);
            Assert.AreEqual("int32", raml.Types["sample"].Object.Properties.First(p => p.Key == "int32prop").Value.Scalar.Format);
            Assert.AreEqual("int16", raml.Types["sample"].Object.Properties.First(p => p.Key == "int16prop").Value.Scalar.Format);
            Assert.AreEqual("int8", raml.Types["sample"].Object.Properties.First(p => p.Key == "int8prop").Value.Scalar.Format);
            Assert.AreEqual("int", raml.Types["sample"].Object.Properties.First(p => p.Key == "intprop").Value.Scalar.Format);
            Assert.AreEqual("float", raml.Types["sample"].Object.Properties.First(p => p.Key == "floatprop").Value.Scalar.Format);
            Assert.AreEqual("double", raml.Types["sample"].Object.Properties.First(p => p.Key == "doubleprop").Value.Scalar.Format);

            Assert.AreEqual("long", raml.Types["myLong"].Scalar.Format);

            Assert.AreEqual("long", raml.Resources.First(r => r.RelativeUri == "/persons").Methods.First().QueryParameters.First().Value.Format);
            //Assert.AreEqual("long", raml.Resources.First(r => r.RelativeUri == "/other").Methods.First().Body.First().Value.InlineType.Scalar.Format);
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