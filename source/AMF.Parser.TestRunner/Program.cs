using AMF.Parser;
using AMF.Parser.Model;
using System;
using System.Threading.Tasks;
using UnitTestProject1;

namespace ConsoleApp2
{
    class Program
    {
        static void Main(string[] args)
        {
            //var a = Test().Result;
            //Console.WriteLine(a);
            RunTests();
        }

        private static void RunTests()
        {
            try
            {
                RunGeneralTests().Wait();
                RunChinookTests();
                RunMoviesTests();
                RunApiWithExamplesTests();
                RunPestoreJsonTests();
                RunArrayTypesTests();
                RunTypeExpressionsTests();
                Console.WriteLine("Succeeded");
            }
            catch (Exception ex)
            {
                InformException(ex);
            }
        }

        private static void RunTypeExpressionsTests()
        {
            var tests = new TypeExpressnsTests();
            tests.Initialize();
            tests.checks();
        }

        private static void RunArrayTypesTests()
        {
            var tests = new ArrayTypesTests();
            tests.Initialize();
            tests.Shapes_count();
        }

        private static void RunPestoreJsonTests()
        {
            var tests = new PetStoreJsonTests();
            tests.Initialize();
            tests.Name_check();
            tests.Version_check();
            tests.Endpoints_count();
            tests.Get_pets_operation();
            tests.Get_pets_id_operation();
        }

        private static async Task RunGeneralTests()
        {
            var tests = new GeneralTests();
            await tests.Should_detect_OAS_type_from_json_file();
            await tests.Should_detect_OAS_type_from_yaml_file();
            await tests.Should_detect_RAML_type_from_file_contents();
            await tests.Should_detect_RAML_type_from_extension();
            await tests.Should_accept_file_without_prefix();
            await tests.Should_accept_file_with_prefix();
            await tests.Should_throw_if_file_not_exists();
        }

        private static void RunApiWithExamplesTests()
        {
            var tests = new ApiWithExamplesTests();
            tests.Initialize();
            tests.Name_check();
            tests.Version_check();
            tests.Endpoints_count();
            tests.Get_root_response();
        }

        private static void RunChinookTests()
        {
            var tests = new ChinookTests();
            tests.Initialize();
            tests.Name_should_be_chinook_raml_1_api();
            tests.Endpoints_should_be_10();
            tests.Get_customers_response();
            tests.Get_albums_response();
            tests.Shapes_count();
            tests.Customer_shape();
            tests.Invoice_shape();
        }

        private static void RunMoviesTests()
        {
            var tests = new MoviesTests();
            tests.Initialize();
            tests.Endpoints_should_be_9();
            tests.Post_Operation_Security();
            tests.Schemes_should_be_http();
            tests.Basepath_should_be_api();
            tests.Version_should_be_1();
            tests.Get_response();
            tests.Post_request();
        }

        private async static Task<AmfModel> Test()
        {
            var parser = new AmfParser();
            var a = await parser.Load("/desarrollo/mulesoft/raml-dotnet-parser-2/source/Raml.Parser.Tests/Specifications/movies-v1.raml");

            return a;
        }

        private static void InformException(Exception ex)
        {
            if (ex.InnerException?.GetType().Name == "AssertionException")
            {
                Console.WriteLine(ex.InnerException.Message);
                Console.WriteLine(ex.InnerException.StackTrace);
                return;
            }

            if (ex.InnerException != null)
            {
                Console.WriteLine(ex.InnerException.Message);
                if (string.IsNullOrWhiteSpace(ex.InnerException.StackTrace))
                    Console.WriteLine(ex.StackTrace);
                else
                    Console.WriteLine(ex.InnerException.StackTrace);
                return;
            }

            Console.WriteLine(ex.Message);
            Console.WriteLine(ex.StackTrace);
        }
    }
}
