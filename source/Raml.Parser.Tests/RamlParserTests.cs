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
		public async Task ShouldLoadFile_WhenValidRAML()
		{
			var parser = new RamlParser();
			var raml = await parser.LoadAsync("parameters.raml");

			Assert.AreEqual(10, raml.Resources.Count());
			Assert.AreEqual(1, raml.Resources.First().Methods.Count());
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
			Assert.AreEqual(2, raml.Resources.First().Methods.Count());
		}

        [Test]
        public async Task ShouldParse_Hybrid()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("hybrid-api.raml");

            Assert.AreEqual(4, raml.Resources.Count());
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
	}
}