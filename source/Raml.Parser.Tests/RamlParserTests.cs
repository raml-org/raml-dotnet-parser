using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using NUnit.Framework;


namespace Raml.Parser.Tests
{
	[TestFixture]
	public class RamlParserTests
	{
		[Test]
		public async Task ShouldLoad_WhenValidRAML()
		{
			var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/raml08/test.raml");

			Assert.AreEqual(2, raml.Resources.Count());
		}

		[Test]
		public async Task ShouldLoad_WhenHasIncludes()
		{
			var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/XKCD/api.raml");

			Assert.AreEqual(2, raml.Resources.Count());
		}


		[Test]
		[ExpectedException(typeof(FormatException))]
		public async Task ShouldThrowError_WhenInvalidRAML()
		{
			var parser = new RamlParser();
            await parser.LoadAsync("Specifications/raml08/invalid.raml");
		}

		[Test]
		public async Task ShouldLoad_WhenAnnotationsTargets()
		{
			var parser = new RamlParser();
			var raml = await parser.LoadAsync("Specifications/annotations-targets.raml");

			Assert.AreEqual(2, raml.Resources.Count());
		}

        [Test]
        public async Task ShouldLoad_WhenAnnotations()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/annotations.raml");

            Assert.AreEqual(2, raml.Resources.Count());
        }

        [Test]
        public async Task ShouldLoad_WhenArrays()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/arrays.raml");

            Assert.AreEqual(1, raml.Resources.Count());
            Assert.AreEqual(4, raml.Types.Count);
        }

        [Test]
        public async Task ShouldLoad_WhenCustomScalar()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/customscalar.raml");

            Assert.AreEqual(2, raml.Types.Count);
        }

        [Test]
        public async Task ShouldLoad_WhenMaps()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/maps.raml");

            Assert.AreEqual(4, raml.Types.Count);
            Assert.AreEqual(1, raml.Resources.Count());
        }

        [Test]
        public async Task ShouldLoad_WhenMoviesV1()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/movies-v1.raml");

            Assert.AreEqual(2, raml.Resources.Count());
            Assert.AreEqual(2, raml.Resources.First().Methods.Count());
        }

        [Test]
        public async Task ShouldLoad_WhenMovieType()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/movietype.raml");

            Assert.AreEqual(1, raml.Types.Count);
            Assert.AreEqual(1, raml.Resources.Count());
        }

        [Test]
        public async Task ShouldLoad_WhenTypeExpressions()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/typeexpressions.raml");

            Assert.AreEqual(1, raml.Types.Count);
            Assert.AreEqual(3, raml.Resources.First().Methods.Count());
        }

		[Test]
		public async Task ShouldParse_WhenHasInclude()
		{
			var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/raml08/include.raml");

			Assert.AreEqual(2, raml.Resources.Count());
			Assert.AreEqual(2, raml.Resources.First().Methods.Count());
		}

		[Test]
		public async Task ShouldParse_Congo()
		{
			var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/raml08/congo-drones-5-f.raml");

			Assert.AreEqual(2, raml.Resources.Count());
			Assert.AreEqual(1, raml.Resources.First().Methods.Count());
            Assert.IsNotNull(raml.ResourceTypes.First(x => x.ContainsKey("collection"))["collection"].Get);
		}

        [Test]
        public async Task ShouldParse_Movies()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/raml08/movies.raml");

            Assert.AreEqual(2, raml.Resources.Count());
            Assert.AreEqual("oauth_2_0", raml.Resources.First().Methods.First(m => m.Verb == "post").SecuredBy.First());
            Assert.IsNotNull(raml.Resources.First(r => r.RelativeUri == "/movies").Methods.First(m => m.Verb == "get")
                .Responses.First(r => r.Code == "200").Body["application/json"].Schema);
        }

        [Test]
        public async Task ShouldParse_Traits()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/raml08/issue37.raml");

            Assert.AreEqual(1, raml.Traits.Count());
            Assert.AreEqual(2, raml.Traits.First()["with2Responses"].Responses.Count());
            Assert.IsTrue(raml.Traits.First()["with2Responses"].Responses.All(r => r.Body["application/json"].Schema != null));
        }

        [Test]
        public async Task ShouldLoad_IncludeWithQuotes()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/raml08/relative-include.raml");

            Assert.IsNotNull(raml);
            Assert.IsNotNull(raml.Resources.First(r => r.RelativeUri == "/movies").Methods.First(m => m.Verb == "get")
                .Responses.First(r => r.Code == "200").Body["application/json"].Schema);
        }

        [Test]
        public async Task ShouldLoadInlinedTypes()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/inlinetype.raml");

            Assert.IsNotNull(raml.Resources.First().Methods.First().Responses.First().Body.First().Value.InlineType);
            Assert.IsNotNull(raml.Resources.First().Methods.Last().Body.First().Value.InlineType);
        }

        [Test]
        public async Task ShouldParseFileType()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/chinook-v1.raml");

            Assert.AreEqual("file", raml.Types["Person"].Object.Properties["Picture"].Type);
        }

        [Test]
        public async Task ShouldParseCustomerAsObject()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/chinook-v1.raml");

            Assert.AreEqual("Person", raml.Types["Customer"].Type);
            Assert.AreEqual("string", raml.Types["Customer"].Object.Properties["Company"].Type);
        }

        [Test]
        public async Task ShouldHandleOverlay()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/librarybooks.raml", new[] {"Specifications/librarybooks-overlay.raml"});

            Assert.AreEqual(2, raml.Documentation.Count());
            Assert.AreEqual("El acceso automatizado a los libros", raml.Documentation.First().Content);
            Assert.AreEqual("Book Library API", raml.Title);
            Assert.AreEqual(1, raml.Resources.First().Methods.Count());
        }

        [Test]
        public async Task ShouldHandleUnionTypes()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/uniontypes.raml");

            Assert.AreEqual(3, raml.Types.Count);
        }

        [Test]
        public async Task ShouldHandleXmlExternal()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/ordersXml-v1.raml");

            Assert.AreEqual(2, raml.Types.Count);
            Assert.IsFalse(string.IsNullOrWhiteSpace(raml.Types["PurchaseOrderType"].External.Xml));
            Assert.IsFalse(string.IsNullOrWhiteSpace(raml.Types["ItemsType"].External.Xml));
        }
	}
}