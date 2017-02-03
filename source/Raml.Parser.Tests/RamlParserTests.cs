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

			Assert.AreEqual(2, raml.Resources.Count);
            Assert.AreEqual(1, raml.Schemas.Count());
            Assert.IsTrue(!string.IsNullOrWhiteSpace(raml.Schemas.First()["comic"]));
		}


		[Test]
		[ExpectedException(typeof(FormatException))]
		public async Task ShouldThrowError_WhenInvalidRAML()
		{
			var parser = new RamlParser();
            await parser.LoadAsync("Specifications/raml08/invalid.raml");
		}

        [Test]
        public async Task ShouldThrowErrorLineInfo_WhenInvalidRAML()
        {
            try
            {
                var parser = new RamlParser();
                await parser.LoadAsync("Specifications/errors/api.raml");
            }
            catch (FormatException ex)
            {
                Assert.IsTrue(ex.Message.Contains("line "));
            }
        }

		[Test, Ignore]
		public async Task ShouldLoad_WhenAnnotationsTargets()
		{
			var parser = new RamlParser();
			var raml = await parser.LoadAsync("Specifications/annotations-targets.raml");

			Assert.AreEqual(2, raml.Resources.Count());
		}

        [Test, Ignore]
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
            Assert.IsNotNull(raml.Types["Movie"].Example);
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

        [Test, Ignore]
        public async Task ShouldBuild_SalesOrder()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("Specifications/salesOrders.raml");

            Assert.AreEqual(18, raml.Types.Count);
            Assert.IsNotNull(raml.ResourceTypes.First(r=>  r.ContainsKey("collectionResource"))["collectionResource"].Post.Body);
            Assert.IsNotNull(raml.ResourceTypes.First(r => r.ContainsKey("collectionResource"))["collectionResource"].Post.Body.Type);
        }

        [Test]
        public async Task ShouldReportErrors()
        {
            var parser = new RamlParser();
            try
            {
                await parser.LoadAsync("Specifications/error-reporting.raml");
            }
            catch (FormatException ex)
            {
                Assert.IsTrue(ex.Message.Contains("Error: Required property: lastname is missed"));
                Assert.IsTrue(ex.Message.Contains("Error: invalid media type"));
            }
            
        }

        [Test]
        public async Task ShouldParseDisorderedTypes()
        {
            var parser = new RamlParser();
            var model = await parser.LoadAsync("Specifications/typesordering.raml");
            Assert.IsNotNull(model);
            Assert.AreEqual(11, model.Types.Count);
            Assert.IsNotNull(model.Types["employee"].Object);
            Assert.IsNotNull(model.Types["SupportRepresentant"].Object);
        }

        [Test]
        public async Task ShouldParseDependentTypes()
        {
            var parser = new RamlParser();
            var model = await parser.LoadAsync("Specifications/dependentTypes.raml");
            Assert.IsNotNull(model);
            Assert.AreEqual(2, model.Types.Count);
        }

        [Test]
        public async Task ShouldParseDateTypes()
        {
            var parser = new RamlParser();
            var model = await parser.LoadAsync("Specifications/dates.raml");
            Assert.AreEqual(3, model.Types.Count);
            Assert.AreEqual(3, model.Types["person"].Object.Properties.Count);
            Assert.AreEqual(2, model.Types["user"].Object.Properties.Count);
            Assert.AreEqual(2, model.Types["sample"].Object.Properties.Count);

            Assert.IsNotNull(model.Types["person"].Object.Properties.First(p => p.Key == "born").Value.Scalar);
            Assert.IsNotNull(model.Types["user"].Object.Properties.First(p => p.Key == "lastaccess").Value.Scalar);
            Assert.IsNotNull(model.Types["sample"].Object.Properties.First(p => p.Key == "prop1").Value.Scalar);
            Assert.IsNotNull(model.Types["sample"].Object.Properties.First(p => p.Key == "prop2").Value.Scalar);

            Assert.AreEqual("date-only", model.Types["person"].Object.Properties.First(p => p.Key == "born").Value.Scalar.Type);
            Assert.AreEqual("datetime", model.Types["user"].Object.Properties.First(p => p.Key == "lastaccess").Value.Scalar.Type);
            Assert.AreEqual("time-only", model.Types["sample"].Object.Properties.First(p => p.Key == "prop1").Value.Scalar.Type);
            Assert.AreEqual("datetime-only", model.Types["sample"].Object.Properties.First(p => p.Key == "prop2").Value.Scalar.Type);
        }

        [Test]
        public async Task ShouldParseSalesOrders()
        {
            var parser = new RamlParser();
            var model = await parser.LoadAsync("Specifications/salesOrders.raml");
            Assert.AreEqual(18, model.Types.Count);
            Assert.IsNotNull(model.Types["salesOrderCollectionResponse"].Object);
            Assert.AreEqual(1, model.Types["salesOrderCollectionResponse"].Object.Properties.Count);
        }

        [Test]
        public async Task ShouldParseMultipleLibraries()
        {
            var parser = new RamlParser();
            var model = await parser.LoadAsync("Specifications/uses-case.raml");
            Assert.AreEqual(14, model.Types.Count);
        }

        [Test]
        public async Task ShouldParseRaml200Tutoriasl()
        {
            var parser = new RamlParser();
            var model = await parser.LoadAsync("Specifications/raml08/raml-tutorial-200/jukebox-api.raml");
            Assert.IsTrue(model.Resources.SelectMany(r => r.Methods).All(m => m.Is.Count() == 3));
            Assert.IsTrue(model.Resources.SelectMany(r => r.Methods).SelectMany(m => m.Is).All(i => i == "searchable" || i == "orderable" || i == "pageable"));
        }

        [Test]
        public async Task ShouldParseResourceTypes()
        {
            var parser = new RamlParser();
            var model = await parser.LoadAsync("Specifications/resource-types.raml");
            Assert.AreEqual(3, model.ResourceTypes.First().Values.First().Get.QueryParameters.Values.Count);
            Assert.AreEqual(1, model.ResourceTypes.First().Values.First().UriParameters.Count);
        }

        [Test]
        public async Task ShouldParseSecuritySchemas()
        {
            var parser = new RamlParser();
            var result = await parser.LoadAsync("Specifications/epi.raml");
            Assert.AreEqual(1, result.SecuritySchemes.Count());
        }
    }
}