using System.Linq;
using NUnit.Framework;
using Raml.Parser.Expressions;
using System.Threading.Tasks;


namespace Raml.Parser.Tests
{
	[TestFixture]
	public class ModelTests
	{
        private async Task<RamlDocument> GetRaml()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/raml08/test.raml");

            return raml;
        }

		[Test]
		public async Task ShouldParseResources()
		{
            var raml = await GetRaml();

			Assert.AreEqual(2, raml.Resources.Count());
			Assert.AreEqual(2, raml.Resources.First().Methods.Count());
			Assert.IsTrue(raml.Resources.First(r => r.RelativeUri == "/sales").Methods.First(m => m.Verb == "post").Body["application/json"].Example.Contains("machineId"));
            Assert.AreEqual(1, raml.Resources.First(r => r.RelativeUri == "/sales").Methods.First(m => m.Verb == "get").Responses.Count());
		}

		[Test]
		public async Task ShouldParseSchemas()
		{
            var raml = await GetRaml();

			Assert.AreEqual(4, raml.Schemas.Count());
		}

		[Test]
		public async Task ShouldParseDocumentation()
		{
            var raml = await GetRaml();

			Assert.AreEqual(1, raml.Documentation.Count());
		}

		[Test]
		public async Task ShouldParseResourceTypes()
		{
            var raml = await GetRaml();

			Assert.AreEqual(2, raml.ResourceTypes.Count());
			Assert.AreEqual(1, raml.ResourceTypes.First()["base"].Get.Responses.Count());
		}

		[Test]
		public async Task ShouldParseTraits()
		{
            var raml = await GetRaml();

			Assert.AreEqual(1, raml.Traits.Count());
			Assert.IsTrue(raml.Traits.First().ContainsKey("filterable"));
			Assert.AreEqual(2, raml.Traits.First()["filterable"].QueryParameters.Count);
		}

		[Test]
		public async Task ShouldParseProtocols()
		{
            var raml = await GetRaml();

			Assert.AreEqual(1, raml.Protocols.Count());
		}

		[Test]
		public async Task ShouldParseSecuritySchemes()
		{
			var parser = new RamlParser();
            var result = await parser.LoadAsync("Specifications/raml08/box.raml");
			
			Assert.AreEqual(1, result.SecuritySchemes.Count());
		}
	}
}
