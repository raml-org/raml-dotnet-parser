﻿using Microsoft.VisualStudio.TestTools.UnitTesting;
using RAML.Parser;
using System.Linq;
using RAML.Parser.Model;

namespace RAML.Parser.Tests
{
    [TestClass]
    public class ChinookTests
    {
        private AmfModel model;

        [TestInitialize]
        public void Initialize()
        {
            var parser = new RamlParser();
            model = parser.Load("./specs/chinook-v1.raml").Result;
        }

        [TestMethod]
        public void Endpoints_should_be_10()
        {
            Assert.AreEqual(10, model.WebApi.EndPoints.Count());
        }

        [TestMethod]
        public void Name_should_be_chinook_raml_1_api()
        {
            Assert.AreEqual("Chinook RAML 1 Api", model.WebApi.Name);
        }

        [TestMethod]
        public void Get_customers_response()
        {
            var resp = model.WebApi.EndPoints.First(e => e.Path == "/customers").Operations.First(o => o.Method == "get").Responses.First();
            Assert.AreEqual("200", resp.StatusCode);
            Assert.AreEqual(1, resp.Payloads.Count());
            Assert.AreEqual("application/json", resp.Payloads.First().MediaType);
            Assert.IsInstanceOfType(resp.Payloads.First().Schema, typeof(ArrayShape));
            var array = (ArrayShape)resp.Payloads.First().Schema;
            //TODO: check
            // Assert.AreEqual("Customer", array.LinkTargetName);
            Assert.IsInstanceOfType(array.Items, typeof(NodeShape));
            var node = (NodeShape)array.Items;
            //TODO: check
            // Assert.AreEqual("Customer", node.LinkTargetName);
            Assert.AreEqual(16, node.Properties.Count());
        }

        [TestMethod]
        public void Get_albums_response()
        {
            var resp = model.WebApi.EndPoints.First(e => e.Path == "/albums").Operations.First(o => o.Method == "get").Responses.First();
            Assert.AreEqual("200", resp.StatusCode);
            Assert.AreEqual(1, resp.Payloads.Count());
            Assert.AreEqual("application/json", resp.Payloads.First().MediaType);
            Assert.IsInstanceOfType(resp.Payloads.First().Schema, typeof(ArrayShape));
            var array = (ArrayShape)resp.Payloads.First().Schema;
            Assert.IsInstanceOfType(array.Items, typeof(NodeShape));
            var node = (NodeShape)array.Items;
            Assert.AreEqual(3, node.Properties.Count());
        }

        [TestMethod]
        public void Shapes_count()
        {
            Assert.AreEqual(9, model.Shapes.Count());
        }

        [TestMethod]
        public void Customer_shape()
        {
            var customer = (NodeShape)model.Shapes.First(e => e.Name == "Customer");
            var person = (NodeShape)model.Shapes.First(e => e.Name == "Person");
            Assert.AreEqual(person.Id, customer.Properties.First(p => p.Range.Name == "Email?").InheritanceProvenance);
            //Assert.AreEqual(1, customer.Inherits.Count());
            //Assert.AreEqual("Person", customer.Inherits.First().Name);
            //Assert.AreEqual(2, customer.Properties.Count());
            //Assert.AreEqual("Company", customer.Properties.First().Range.Name);
            //Assert.AreEqual("CustomerStatus", customer.Properties.Last().Range.Name);
            //Assert.AreEqual(3, customer.Properties.Last().Range.Values.Count());
            //Assert.IsTrue(customer.Properties.Last().Range.Values.All(v => v != null));
            // Assert.AreEqual(14, ((NodeShape)customer.Inherits.First()).Properties.Count());
        }

        [TestMethod]
        public void Invoice_shape()
        {
            var invoice = (NodeShape)model.Shapes.First(e => e.Name == "Invoice");
            var customer = invoice.Properties.First(p => p.Path == "http://a.ml/vocabularies/data#Customer").Range;
            Assert.IsInstanceOfType(customer, typeof(AnyShape));

            var person = (NodeShape)model.Shapes.First(e => e.Name == "Person");
            var picture = person.Properties.First(p => p.Path == "http://a.ml/vocabularies/data#Picture").Range;
            Assert.IsInstanceOfType(picture, typeof(FileShape));

            var lines = invoice.Properties.First(p => p.Path.ToLowerInvariant().EndsWith("lines"));
            // TODO: inheritance!
            //var array = (ArrayShape)lines.Range.Inherits.First();
            //Assert.AreEqual("/declarations/types/InvoiceLine", array.Items.LinkTargetName);
        }
    }
}
