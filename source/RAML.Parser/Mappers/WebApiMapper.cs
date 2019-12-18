using RAML.Parser.Model;
using System.Collections.Generic;

namespace RAML.Parser.Mappers
{
    class WebApiMapper
    {
        public static WebApi Map(IDictionary<string, object> model)
        {
            if (model == null)
                return null;

            var name = model["name"] as string;
            var description = model["description"] as string;
            var host = model["host"] as string;
            IEnumerable<string> schemes = StringEnumerationMapper.Map(model["schemes"] as object[]);
            IEnumerable<EndPoint> endPoints = EndPointMapper.Map(model["endpoints"] as object[]);
            IEnumerable<string> servers = StringEnumerationMapper.Map(model["servers"] as object[]);
            IEnumerable<string> accepts = StringEnumerationMapper.Map(model["accepts"] as object[]);
            IEnumerable<string> contentType = StringEnumerationMapper.Map(model["contentType"] as object[]);
            string version = model["version"] as string;
            string termsOfService = model["termsOfService"] as string;
            Organization provider = OrganizationMapper.Map(model["provider"] as IDictionary<string, object>);
            License license = LicenseMapper.Map(model["license"] as IDictionary<string, object>);
            IEnumerable<Documentation> documentations = DocumentationMapper.Map(model["documentations"] as object[]);
            IEnumerable<Parameter> baseUriParameters = ParameterMapper.Map(model["baseUriParameters"] as object[]);
            IEnumerable<SecurityRequirement> security = SecurityRequirementMapper.Map(model["security"] as object[]);
            return new WebApi(name, description, host, schemes, endPoints, servers, accepts, contentType, version, termsOfService, 
                provider, license, documentations, baseUriParameters, security);
        }

    }
}
