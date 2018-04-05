using Microsoft.VisualStudio.TestTools.UnitTesting;
using AMF.Parser;
using System.Linq;
using AMF.Parser.Model;

namespace UnitTestProject1
{
    [TestClass]
    public class MoviesTests
    {
        private AmfModel model;

        [TestInitialize]
        public void Initialize()
        {
            var parser = new AmfParser();
            model = parser.Load("./specs/movies-v1.raml").Result;
        }

        [TestMethod]
        public void Endpoints_should_be_9()
        {
            Assert.AreEqual(9, model.WebApi.EndPoints.Count());
        }

        [TestMethod]
        public void Schemes_should_be_http()
        {
            Assert.AreEqual(1, model.WebApi.Schemes.Count());
            Assert.AreEqual("HTTP", model.WebApi.Schemes.First());
        }

        [TestMethod]
        public void Version_should_be_1()
        {
            Assert.AreEqual("1.0", model.WebApi.Version);
        }

        [TestMethod]
        public void Basepath_should_be_api()
        {
            Assert.AreEqual("/api", model.WebApi.BasePath);
        }

        [TestMethod]
        public void Host_should_be_movies_com()
        {
            Assert.AreEqual("movies.com", model.WebApi.Host);
        }

        [TestMethod]
        public void Name_should_be_movies_v_1()
        {
            Assert.AreEqual("Movies v 1", model.WebApi.Name);
        }

        [TestMethod]
        public void Post_Operation_Security()
        {
            Assert.AreEqual(1, model.WebApi.EndPoints.First(e => e.Path == "/movies").Operations.First(o => o.Method == "post").Security.Count());
            Assert.AreEqual("OAuth 2.0", model.WebApi.EndPoints.First(e => e.Path == "/movies").Operations.First(o => o.Method == "post").Security.First().Type);
            Assert.AreEqual("https://localhost:8081/oauth/authorize", model.WebApi.EndPoints.First(e => e.Path == "/movies").Operations.First(o => o.Method == "post").Security.First().Settings.AuthorizationUri);
            Assert.AreEqual("https://localhost:8081/oauth/access_token", model.WebApi.EndPoints.First(e => e.Path == "/movies").Operations.First(o => o.Method == "post").Security.First().Settings.AccessTokenUri);
            Assert.AreEqual("authorization_code", model.WebApi.EndPoints.First(e => e.Path == "/movies").Operations.First(o => o.Method == "post").Security.First().Settings.AuthorizationGrants.First());
            Assert.AreEqual("read", model.WebApi.EndPoints.First(e => e.Path == "/movies").Operations.First(o => o.Method == "post").Security.First().Settings.Scopes.First().Name);
            Assert.AreEqual("write", model.WebApi.EndPoints.First(e => e.Path == "/movies").Operations.First(o => o.Method == "post").Security.First().Settings.Scopes.Last().Name);
            Assert.AreEqual("access_token", model.WebApi.EndPoints.First(e => e.Path == "/movies").Operations.First(o => o.Method == "post").Security.First().QueryParameters.First().Name);
            Assert.AreEqual("Authorization", model.WebApi.EndPoints.First(e => e.Path == "/movies").Operations.First(o => o.Method == "post").Security.First().Headers.First().Name);
        }

        [TestMethod]
        public void Get_response()
        {
            var resp = model.WebApi.EndPoints.First(e => e.Path == "/movies").Operations.First(o => o.Method == "get").Responses.First();
            Assert.AreEqual("200", resp.StatusCode);
            Assert.AreEqual(1, resp.Payloads.Count());
            Assert.AreEqual("application/json", resp.Payloads.First().MediaType);
            Assert.IsInstanceOfType(resp.Payloads.First().Schema, typeof(ArrayShape));
            var array = (ArrayShape)resp.Payloads.First().Schema;
            Assert.IsInstanceOfType(array.Items, typeof(NodeShape));
            var node = (NodeShape)array.Items;
            Assert.AreEqual(9, node.Properties.Count());

            PropertiesAsserts(node);
        }

        [TestMethod]
        public void Post_request()
        {
            var request = model.WebApi.EndPoints.First(e => e.Path == "/movies").Operations.First(o => o.Method == "post").Request;
            Assert.AreEqual(1, request.Payloads.Count());
            Assert.AreEqual("application/json", request.Payloads.First().MediaType);
            Assert.AreEqual("Movie", request.Payloads.First().Schema.Name);
            Assert.IsInstanceOfType(request.Payloads.First().Schema, typeof(NodeShape));
            var node = (NodeShape)request.Payloads.First().Schema;
            Assert.AreEqual(9, node.Properties.Count());

            PropertiesAsserts(node);
        }

        private static void PropertiesAsserts(NodeShape node)
        {
            var idProp = node.Properties.First(p => p.Path.EndsWith("#id"));
            Assert.IsInstanceOfType(idProp.Range, typeof(ScalarShape));
            Assert.IsTrue(idProp.Required);
            var id = (ScalarShape)idProp.Range;
            Assert.IsTrue(id.DataType.EndsWith("#integer"));
            Assert.AreEqual("id", id.Name);

            var nameProp = node.Properties.First(p => p.Path.EndsWith("#name"));
            Assert.IsTrue(nameProp.Required);
            var name = (ScalarShape)nameProp.Range;
            Assert.IsTrue(name.DataType.EndsWith("#string"));
            Assert.AreEqual(255, name.MaxLength);
            Assert.AreEqual("name", name.Name);

            var durationProp = node.Properties.First(p => p.Path.EndsWith("#duration"));
            Assert.IsFalse(durationProp.Required);
            var duration = (ScalarShape)durationProp.Range;
            Assert.IsTrue(duration.DataType.EndsWith("#float"));
            Assert.AreEqual("1", duration.Minimum);
            Assert.AreEqual("duration", duration.Name);

            var storylineProp = node.Properties.First(p => p.Path.EndsWith("#storyline?"));
            Assert.IsFalse(storylineProp.Required);
            Assert.AreEqual("storyline?", storylineProp.Range.Name);

            Assert.AreEqual(1, node.Examples.Count());
            Assert.IsTrue(node.Examples.First().Value.Length > 0);
        }
    }
}
