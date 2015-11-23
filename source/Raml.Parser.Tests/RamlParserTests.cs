using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using NUnit.Framework;
using Raml.Parser.Expressions;


namespace Raml.Parser.Tests
{
	[TestFixture]
	public class RamlParserTests
	{
	    private static RamlParser parser;

        [Test]
        public async Task ShouldParseTypes_WhenMovies_Raml1()
        {
            var raml = await Parse("specifications/movies-v1.raml");

            Assert.AreEqual(2, raml.Resources.Count());
            Assert.AreEqual(1, raml.Types.Count());
            Assert.AreEqual(9, raml.Types.First().Properties.Count());
            Assert.AreEqual(255, raml.Types.First().Properties.First(p => p.Key == "name").Value.MaxLength);
            Assert.AreEqual(1, raml.Types.First().Properties.First(p => p.Key == "duration").Value.Minimum);
            Assert.AreEqual(false, raml.Types.First().Properties.First(p => p.Key == "duration").Value.Required);
            Assert.AreEqual("oauth_2_0", raml.Resources.First().Methods.First(m => m.Verb == "post").SecuredBy.First());
        }

	    [Test]
		public async Task ShouldLoad_WhenValidRAML()
		{
		    var raml = await Parse("test.raml");

			Assert.AreEqual(2, raml.Resources.Count());
		}

		[Test]
		public async Task ShouldLoad_WhenHasIncludes()
		{
		    var raml = await Parse("Specifications/XKCD/api.raml");

		    Assert.AreEqual(2, raml.Resources.Count());
		}


	    [Test]
		[ExpectedException(typeof(FormatException))]
		public async Task ShouldThrowError_WhenInvalidRAML()
		{
            var raml = await Parse("invalid.raml");
		}

		[Test]
		public async Task ShouldLoadFile_WhenValidRAML()
		{
            var raml = await Parse("Specifications/parameters.raml");

			Assert.AreEqual(1, raml.Resources.Count());
			Assert.AreEqual(1, raml.Resources.First().Methods.Count());
		}

		[Test]
		public async Task ShouldParse_WhenHasInclude()
		{
            var raml = await Parse("include.raml");

			Assert.AreEqual(2, raml.Resources.Count());
			Assert.AreEqual(2, raml.Resources.First().Methods.Count());
		}

		[Test]
		public async Task ShouldParse_Congo()
		{
            var raml = await Parse("congo-drones-5-f.raml");

			Assert.AreEqual(2, raml.Resources.Count());
			Assert.AreEqual(2, raml.Resources.First().Methods.Count());
		}

        [Test]
        public async Task ShouldParse_Hybrid()
        {
            var raml = await Parse("hybrid-api.raml");

            Assert.AreEqual(4, raml.Resources.Count());
        }

        [Test]
        public async Task ShouldParse_Movies()
        {
            var raml = await Parse("movies.raml");

            Assert.AreEqual(2, raml.Resources.Count());
            Assert.AreEqual("oauth_2_0", raml.Resources.First().Methods.First(m => m.Verb == "post").SecuredBy.First());
        }

        [Test]
        public async Task ShouldLoad_IncludeWithQuotes()
        {
            var raml = await Parse("relative-include.raml");

            Assert.IsNotNull(raml);
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