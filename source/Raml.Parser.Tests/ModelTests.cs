using System.Linq;
using Raml.Parser.Expressions;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Raml.Parser.Tests
{
	[TestClass]
	public class ModelTests
	{
        private async Task<RamlDocument> GetRaml()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/raml08/test.raml");

            return raml;
        }

		[TestMethod]
		public async Task ShouldParseResources()
		{
            var raml = await GetRaml();

			Assert.AreEqual(2, raml.Resources.Count());
			Assert.AreEqual(2, raml.Resources.First().Methods.Count());
			Assert.IsTrue(raml.Resources.First(r => r.RelativeUri == "/sales").Methods.First(m => m.Verb == "post").Body["application/json"].Example.Contains("machineId"));
            Assert.AreEqual(1, raml.Resources.First(r => r.RelativeUri == "/sales").Methods.First(m => m.Verb == "get").Responses.Count());
		}

		[TestMethod]
		public async Task ShouldParseSchemas()
		{
            var raml = await GetRaml();

			Assert.AreEqual(4, raml.Schemas.Count());
		}

		[TestMethod]
		public async Task ShouldParseDocumentation()
		{
            var raml = await GetRaml();

			Assert.AreEqual(1, raml.Documentation.Count());
		}

		[TestMethod]
		public async Task ShouldParseResourceTypes()
		{
            var raml = await GetRaml();

			Assert.AreEqual(2, raml.ResourceTypes.Count());
			Assert.AreEqual(1, raml.ResourceTypes.First()["base"].Get.Responses.Count());
		}

		[TestMethod]
		public async Task ShouldParseTraits()
		{
            var raml = await GetRaml();

			Assert.AreEqual(1, raml.Traits.Count());
			Assert.IsTrue(raml.Traits.First().ContainsKey("filterable"));
			Assert.AreEqual(2, raml.Traits.First()["filterable"].QueryParameters.Count);
		}

		[TestMethod]
		public async Task ShouldParseProtocols()
		{
            var raml = await GetRaml();

			Assert.AreEqual(1, raml.Protocols.Count());
		}

		[TestMethod]
		public async Task ShouldParseSecuritySchemes()
		{
			var parser = new RamlParser();
            var result = await parser.LoadAsync("Specifications/raml08/box.raml");
			
			Assert.AreEqual(1, result.SecuritySchemes.Count());
		}

	    [TestMethod]
	    public async Task ShouldParseHeaders()
	    {
	        var parser = new RamlParser();
	        var result = await parser.LoadAsync("Specifications/headers.raml");
            Assert.AreEqual("Zencoder-Api-Key", result.Resources.First().Methods.First().Headers.Keys.First());
	    }

        [TestMethod]
        public async Task ShouldParseHeadersWhenInTraits()
        {
            var parser = new RamlParser();
            var result = await parser.LoadAsync("Specifications/headers-traits.raml");
            Assert.IsTrue(result.Resources.First(r => r.RelativeUri == "/users").Methods.First().Headers.ContainsKey("X-Tracker"));
            Assert.IsTrue(result.Resources.First(r => r.RelativeUri == "/users").Methods.First().Headers.ContainsKey("X-Dept"));
            Assert.IsTrue(result.Traits.First(t => t.ContainsKey("traceable"))["traceable"].Headers.ContainsKey("X-Tracker"));
            Assert.IsTrue(result.Traits.First(t => t.ContainsKey("chargeable"))["chargeable"].Headers.ContainsKey("X-Dept"));
        }

        [TestMethod]
        public async Task ShouldParseHeadersWhenInResponses()
        {
            var parser = new RamlParser();
            var result = await parser.LoadAsync("Specifications/headers-responses.raml");
            Assert.IsTrue(result.Resources.First(r => r.RelativeUri == "/jobs").Methods.First().Responses.First().Headers.ContainsKey("Location"));
            Assert.IsTrue(result.Resources.First(r => r.RelativeUri == "/jobs").Methods.First().Responses.First().Headers.ContainsKey("Other"));
        }

        [TestMethod]
        public async Task ShouldParseQueryString()
        {
            var parser = new RamlParser();
            var result = await parser.LoadAsync("Specifications/querystring.raml");
            Assert.AreEqual(2, result.Resources.First(r => r.RelativeUri == "/locations").Methods.First().QueryString.Type.Count());
            Assert.AreEqual("paging",result.Resources.First(r => r.RelativeUri == "/locations").Methods.First().QueryString.Type.First());
            Assert.AreEqual("lat-long | loc", result.Resources.First(r => r.RelativeUri == "/locations").Methods.First().QueryString.Type.Last());
        }
    }
}
