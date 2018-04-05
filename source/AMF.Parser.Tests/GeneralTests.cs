using Microsoft.VisualStudio.TestTools.UnitTesting;
using AMF.Parser;
using System.Linq;
using AMF.Parser.Model;
using System.Threading.Tasks;

namespace UnitTestProject1
{
    [TestClass]
    public class GeneralTests
    {
        private AmfParser parser = new AmfParser();

        [TestMethod]
        public async Task Should_detect_RAML_type_from_extension()
        {
            var type = await AmfParser.DetectType("specs/movies-v1.raml");
            Assert.AreEqual(SpecificationType.RAML, type);
        }

        [TestMethod]
        public async Task Should_detect_RAML_type_from_file_contents()
        {
            var type = await AmfParser.DetectType("specs/movies-v1.yaml");
            Assert.AreEqual(SpecificationType.RAML, type);
        }

        [TestMethod]
        public async Task Should_detect_OAS_type_from_yaml_file()
        {
            var type = await AmfParser.DetectType("specs/oas/yaml/api-with-examples.yaml");
            Assert.AreEqual(SpecificationType.OAS, type);
        }

        [TestMethod]
        public async Task Should_detect_OAS_type_from_json_file()
        {
            var type = await AmfParser.DetectType("specs/oas/json/api-with-examples.json");
            Assert.AreEqual(SpecificationType.OAS, type);
        }

        [TestMethod]
        public async Task Should_accept_file_without_prefix()
        {
            var model = await parser.Load("./specs/chinook-v1.raml");
            Assert.IsNotNull(model);
        }

        [TestMethod]
        public async Task Should_accept_file_with_prefix()
        {
            var model = await parser.Load("file://./specs/chinook-v1.raml");
            Assert.IsNotNull(model);
        }

        [TestMethod, ExpectedException(typeof(System.IO.FileNotFoundException))]
        public async Task Should_throw_if_file_not_exists()
        {
            await Assert.ThrowsExceptionAsync<System.IO.FileNotFoundException>(() => { return parser.Load("./non-existing.file"); });
        }

    }
}
