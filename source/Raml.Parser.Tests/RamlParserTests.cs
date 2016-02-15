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
			var raml = await parser.LoadAsync("test.raml");

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
			await parser.LoadAsync("invalid.raml");
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
            Assert.AreEqual(4, raml.Types.Count());
        }

        [Test]
        public async Task ShouldLoad_WhenCustomScalar()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/customscalar.raml");

            Assert.AreEqual(2, raml.Types.Count());
        }

        [Test]
        public async Task ShouldLoad_WhenMaps()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/maps.raml");

            Assert.AreEqual(4, raml.Types.Count());
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

            Assert.AreEqual(1, raml.Types.Count());
            Assert.AreEqual(1, raml.Resources.Count());
        }

        [Test]
        public async Task ShouldLoad_WhenTypeExpressions()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/typeexpressions.raml");

            Assert.AreEqual(1, raml.Types.Count());
            Assert.AreEqual(3, raml.Resources.First().Methods.Count());
        }

		[Test]
		public async Task ShouldParse_WhenHasInclude()
		{
			var parser = new RamlParser();
			var raml = await parser.LoadAsync("include.raml");

			Assert.AreEqual(2, raml.Resources.Count());
			Assert.AreEqual(2, raml.Resources.First().Methods.Count());
		}

		[Test]
		public async Task ShouldParse_Congo()
		{
			var parser = new RamlParser();
			var raml = await parser.LoadAsync("congo-drones-5-f.raml");

			Assert.AreEqual(2, raml.Resources.Count());
			Assert.AreEqual(1, raml.Resources.First().Methods.Count());
		}

        [Test]
        public async Task ShouldParse_Movies()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("movies.raml");

            Assert.AreEqual(2, raml.Resources.Count());
            Assert.AreEqual("oauth_2_0", raml.Resources.First().Methods.First(m => m.Verb == "post").SecuredBy.First());
        }

        [Test]
        public async Task ShouldLoad_IncludeWithQuotes()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("relative-include.raml");

            Assert.IsNotNull(raml);
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

        [Test, Ignore]
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
        public async Task ShouldHandleLibraries()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/file-libraries.raml");

            Assert.AreEqual(1, raml.ResourceTypes.Count());
            Assert.AreEqual("files.file-type.File", raml.ResourceTypes.First()["file"].Get.Responses.First().Body["application/json"].Type);
        }
	}
}