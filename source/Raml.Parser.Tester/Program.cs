using System;
using System.Linq;
using System.Threading.Tasks;
using NUnit.Framework;

namespace Raml.Parser.Tester
{
    class Program
    {
        static void Main(string[] args)
        {
            RunTests().Wait();
        }

        private static async Task RunTests()
        {
            await ShouldLoad_WhenValidRAML();
            await ShouldParse_Congo();
            await ShouldParse_Movies();
            await ShouldLoad_WhenXKCD();
            await ShouldParse_WhenHasInclude();
            
            await ShouldParse_Annotations(); // RAML 1.0 sample

            await ShouldLoad_WhenChinnok();
            await ShouldLoad_WhenDars();
            await ShouldLoad_WhenParams();
            await ShouldLoad_WhenExternalRefs();

            await ShouldThrowError_WhenInvalidRAML();

            
            // freeze
            await ShouldLoad_WhenEpi();
            await ShouldParse_Hybrid();
            await ShouldLoad_IncludeWithQuotes();
        }

        public static async Task ShouldLoad_WhenExternalRefs()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("files/external-refs.raml");

            Assert.AreEqual(2, raml.Resources.Count());
        }

        public static async Task ShouldLoad_WhenEpi()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("files/epi.raml");

            Assert.AreEqual(1, raml.Resources.Count());
        }

        public static async Task ShouldLoad_WhenDars()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("files/dars.raml");

            Assert.AreEqual(1, raml.Resources.Count());
        }

        public static async Task ShouldLoad_WhenParams()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("files/darsparam.raml");

            Assert.AreEqual(1, raml.Resources.Count());
        }

        public static async Task ShouldLoad_WhenChinnok()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("files/chinook.raml");

            Assert.AreEqual(5, raml.Resources.Count());
        }

        public static async Task ShouldLoad_WhenValidRAML()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("files/test.raml");

            Assert.AreEqual(2, raml.Resources.Count());
        }

        public static async Task ShouldLoad_WhenXKCD()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("files/XKCD/api.raml");

            Assert.AreEqual(2, raml.Resources.Count());
        }


        public static async Task ShouldThrowError_WhenInvalidRAML()
        {
            var parser = new RamlParser();
            try
            {
                await parser.LoadAsync("files/invalid.raml");
            }
            catch (FormatException)
            {
                Assert.IsTrue(true);
            }
            catch (Exception e)
            {
                Assert.IsTrue(false, "Expected FormatException, actual " + e.GetType() + " " + e.GetBaseException());
            }
        }

        public static async Task ShouldParse_Annotations()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("files/parameters.raml");

            Assert.AreEqual(1, raml.Resources.Count());
            Assert.AreEqual(1, raml.Resources.First().Methods.Count());
        }

        public static async Task ShouldParse_WhenHasInclude()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("files/include.raml");

            Assert.AreEqual(2, raml.Resources.Count());
            Assert.AreEqual(2, raml.Resources.First().Methods.Count());
        }

        public static async Task ShouldParse_Congo()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("files/congo-drones-5-f.raml");

            Assert.AreEqual(2, raml.Resources.Count());
            Assert.AreEqual(2, raml.Resources.First().Methods.Count());
            Assert.AreEqual(3, raml.Resources.First().Resources.First().Methods.Count());
        }

        public static async Task ShouldParse_Hybrid()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("files/hybrid-api.raml");

            Assert.AreEqual(4, raml.Resources.Count());
        }

        public static async Task ShouldParse_Movies()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("files/movies.raml");

            Assert.AreEqual(2, raml.Resources.Count());
            Assert.AreEqual("oauth_2_0", raml.Resources.First().Methods.First(m => m.Verb == "post").SecuredBy.First());
        }

        public static async Task ShouldLoad_IncludeWithQuotes()
        {
            var parser = new RamlParser();
            var raml = await parser.LoadAsync("files/relative-include.raml");

            Assert.IsNotNull(raml);
        }
    }
}
