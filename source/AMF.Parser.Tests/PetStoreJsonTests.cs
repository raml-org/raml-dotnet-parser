using Microsoft.VisualStudio.TestTools.UnitTesting;
using AMF.Parser;
using System.Linq;
using AMF.Parser.Model;

namespace UnitTestProject1
{
    [TestClass]
    public class PetStoreJsonTests
    {
        private AmfModel model;

        [TestInitialize]
        public void Initialize()
        {
            var parser = new AmfParser();
            model = parser.Load("./specs/oas/json/petstore.json").Result;
        }

        [TestMethod]
        public void License_check()
        {
            Assert.AreEqual("MIT", model.WebApi.License.Name);
        }

        [TestMethod]
        public void Endpoints_count()
        {
            Assert.AreEqual(2, model.WebApi.EndPoints.Count());
        }

        [TestMethod]
        public void Name_check()
        {
            Assert.AreEqual("Swagger Petstore", model.WebApi.Name);
        }

        [TestMethod]
        public void Version_check()
        {
            Assert.AreEqual("1.0.0", model.WebApi.Version);
        }

        [TestMethod]
        public void Get_pets_operation()
        {
            var get = model.WebApi.EndPoints.First(e => e.Path == "/pets").Operations.First(o => o.Method == "get");
            Assert.AreEqual("List all pets", get.Summary);
            Assert.AreEqual("listPets", get.Name);
            // tags ?
            var param = get.Request.QueryParameters.First();
            Assert.AreEqual("limit", param.Name);
            Assert.AreEqual(false, param.Required);
            var paramShape = (ScalarShape)param.Schema;
            Assert.AreEqual("int32", paramShape.Format);
            Assert.AreEqual("http://www.w3.org/2001/XMLSchema#integer", paramShape.DataType);

            var okResp = get.Responses.First(r => r.StatusCode == "200" && r.Name == "200");
            Assert.AreEqual("An paged array of pets", okResp.Description);
            Assert.AreEqual(1, okResp.Headers.Count());
            Assert.AreEqual("x-next", okResp.Headers.First().Name);
            Assert.AreEqual("A link to the next page of responses", okResp.Headers.First().Description);

            var okShape = (ArrayShape)okResp.Payloads.First().Schema;
            var petShape = (NodeShape)okShape.Items;
            Assert.AreEqual(3, petShape.Properties.Count());

            var id = (ScalarShape)petShape.Properties.First(p => p.Path == "http://raml.org/vocabularies/data#id").Range;
            Assert.AreEqual("http://www.w3.org/2001/XMLSchema#long", id.DataType);
            Assert.AreEqual("int64", id.Format);

            var tag = (ScalarShape)petShape.Properties.First(p => p.Path == "http://raml.org/vocabularies/data#tag").Range;
            Assert.AreEqual("http://www.w3.org/2001/XMLSchema#string", tag.DataType);

            var defaultResp = get.Responses.First(r => r.Name == "default");
            Assert.AreEqual("unexpected error", defaultResp.Description);
            Assert.AreEqual("Error", defaultResp.Payloads.First().Schema.Name);
        }

        public void Get_pets_id_operation()
        {
            var get = model.WebApi.EndPoints.First(e => e.Path == "/pets/{petId}").Operations.First(o => o.Method == "get");
            Assert.AreEqual("Info for a specific pet", get.Summary);
            Assert.AreEqual("showPetById", get.Name);
            
            var param = get.Request.QueryParameters.First();
            Assert.AreEqual("petId", param.Name);
            Assert.AreEqual(true, param.Required);
            var paramShape = (ScalarShape)param.Schema;
            Assert.AreEqual("http://www.w3.org/2001/XMLSchema#string", paramShape.DataType);
        }

    }
}
