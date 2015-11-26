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
        public async Task ShouldGetAnnotations()
        {
            var raml = await Parse("Specifications/annotations-targets.raml");

            Assert.AreEqual(2, raml.Annotations.Count());
            Assert.AreEqual(2, raml.Resources.First().Annotations.Count());
            Assert.AreEqual(2, raml.Resources.Last().Methods.First().Annotations.Count());
            Assert.AreEqual(2, raml.Resources.Last().Methods.First().Responses.First().Annotations.Count());
        }

        [Test]
        public async Task ShouldGetAnnotationsTypes_WithAllowedTargets()
        {
            var raml = await Parse("Specifications/annotations-targets.raml");

            Assert.AreEqual(6, raml.AnnotationTypes.Count());
            Assert.AreEqual(3, raml.AnnotationTypes["feedbackRequested"].AllowedTargets.Count);
            Assert.AreEqual(1, raml.AnnotationTypes["assertion"].AllowedTargets.Count);
        }

        [Test]
        public async Task ShouldGetAnnotationsTypes()
        {
            var raml = await Parse("Specifications/annotations.raml");

            Assert.AreEqual(6, raml.AnnotationTypes.Count());
            Assert.AreEqual(1, raml.AnnotationTypes["experimental"].Parameters.Count);
            Assert.AreEqual(2, raml.AnnotationTypes["clearanceLevel"].Parameters.Count);
        }


	    [Test]
		public async Task ShouldLoad_WhenValidRAML()
		{
            var raml = await Parse("Specifications/raml08/test.raml");

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
            var raml = await Parse("Specifications/raml08/invalid.raml");
		}

		[Test]
		public async Task ShouldLoadValidRaml_WithAnnotations()
		{
            var raml = await Parse("Specifications/parameters.raml");

			Assert.AreEqual(1, raml.Resources.Count());
			Assert.AreEqual(1, raml.Resources.First().Methods.Count());
		}

		[Test]
		public async Task ShouldParse_WhenHasInclude()
		{
            var raml = await Parse("Specifications/raml08/include.raml");

			Assert.AreEqual(2, raml.Resources.Count());
			Assert.AreEqual(2, raml.Resources.First().Methods.Count());
		}

		[Test]
		public async Task ShouldParse_Congo()
		{
            var raml = await Parse("Specifications/raml08/congo-drones-5-f.raml");

			Assert.AreEqual(2, raml.Resources.Count());
			Assert.AreEqual(2, raml.Resources.First().Methods.Count());
		}

        [Test]
        public async Task ShouldParse_Hybrid()
        {
            var raml = await Parse("Specifications/raml08/hybrid-api.raml");

            Assert.AreEqual(4, raml.Resources.Count());
        }

        [Test]
        public async Task ShouldParse_Movies()
        {
            var raml = await Parse("Specifications/raml08/movies.raml");

            Assert.AreEqual(2, raml.Resources.Count());
            Assert.AreEqual("oauth_2_0", raml.Resources.First().Methods.First(m => m.Verb == "post").SecuredBy.First());
        }

        [Test]
        public async Task ShouldLoad_IncludeWithQuotes()
        {
            var raml = await Parse("Specifications/raml08/relative-include.raml");

            Assert.IsNotNull(raml);
        }

        [Test]
        public async Task ShouldLoad_WhenContacts()
        {
            var raml = await Parse("Specifications/raml08/contacts.raml");

            Assert.AreEqual(2, raml.Resources.Count());
            Assert.AreEqual(1, raml.Resources.Last().Methods.Count());
            Assert.AreEqual(1, raml.Resources.Last().Resources.First().Methods.Count());
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