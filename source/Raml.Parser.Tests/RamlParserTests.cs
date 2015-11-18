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
		    var fi = new FileInfo("test.raml");
			var raml = await parser.LoadAsync(fi.FullName);

			Assert.AreEqual(2, raml.Resources.Count());
		}

		[Test]
		public async Task ShouldLoad_WhenHasIncludes()
		{
			var parser = new RamlParser();
            var fi = new FileInfo("Specifications/XKCD/api.raml");
            var raml = await parser.LoadAsync(fi.FullName);

			Assert.AreEqual(2, raml.Resources.Count());
		}


		[Test]
		[ExpectedException(typeof(FormatException))]
		public async Task ShouldThrowError_WhenInvalidRAML()
		{
			var parser = new RamlParser();
            var fi = new FileInfo("invalid.raml");
            await parser.LoadAsync(fi.FullName);
		}

		[Test]
		public async Task ShouldLoadFile_WhenValidRAML()
		{
			var parser = new RamlParser();
            var fi = new FileInfo("Specifications/parameters.raml");
            var raml = await parser.LoadAsync(fi.FullName);

			Assert.AreEqual(1, raml.Resources.Count());
			Assert.AreEqual(1, raml.Resources.First().Methods.Count());
		}

		[Test]
		public async Task ShouldParse_WhenHasInclude()
		{
            var parser = new RamlParser();
            var fi = new FileInfo("include.raml");
            var raml = await parser.LoadAsync(fi.FullName);

			Assert.AreEqual(2, raml.Resources.Count());
			Assert.AreEqual(2, raml.Resources.First().Methods.Count());
		}

		[Test]
		public async Task ShouldParse_Congo()
		{
			var parser = new RamlParser();
            var fi = new FileInfo("congo-drones-5-f.raml");
            var raml = await parser.LoadAsync(fi.FullName);

			Assert.AreEqual(2, raml.Resources.Count());
			Assert.AreEqual(2, raml.Resources.First().Methods.Count());
		}

        [Test]
        public async Task ShouldParse_Hybrid()
        {
            var parser = new RamlParser();
            var fi = new FileInfo("hybrid-api.raml");
            var raml = await parser.LoadAsync(fi.FullName);

            Assert.AreEqual(4, raml.Resources.Count());
        }

        [Test]
        public async Task ShouldParse_Movies()
        {
            var parser = new RamlParser();
            var fi = new FileInfo("movies.raml");
            var raml = await parser.LoadAsync(fi.FullName);

            Assert.AreEqual(2, raml.Resources.Count());
            Assert.AreEqual("oauth_2_0", raml.Resources.First().Methods.First(m => m.Verb == "post").SecuredBy.First());
        }

        [Test]
        public async Task ShouldLoad_IncludeWithQuotes()
        {
            var parser = new RamlParser();
            var fi = new FileInfo("relative-include.raml");
            var raml = await parser.LoadAsync(fi.FullName);

            Assert.IsNotNull(raml);
        }
	}
}