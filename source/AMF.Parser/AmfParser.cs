using AMF.Parser.Mappers;
using AMF.Parser.Model;
using EdgeJs;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace AMF.Parser
{
    public class AmfParser
    {
        public async Task<AmfModel> Load(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("filePath");

            SpecificationType type = await DetectType(filePath);
            return await Load(type, filePath);
        }

        public static async Task<SpecificationType> DetectType(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("filePath");

            if (filePath.StartsWith("file://"))
                filePath = filePath.Substring(7);

            var file = File.OpenText(filePath);
            var firstLine = await file.ReadLineAsync();

            if (firstLine.Contains("#%RAML 0.8"))
                return SpecificationType.RAML08;

            if (firstLine.Contains("#%RAML"))
                return SpecificationType.RAML;

            if (filePath.EndsWith(".raml"))
                return SpecificationType.RAML;

            if (firstLine.Contains("swagger"))
                return SpecificationType.OAS;
            
            var secondLine = await file.ReadLineAsync();
            if (secondLine.Contains("swagger"))
                return SpecificationType.OAS;

            throw new FormatException("Unable to determine format, please use overload method and specify type manually. Valid types are RAML and OAS 2.0");
        }

        public async Task<AmfModel> Load(SpecificationType type, string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("filePath");

            filePath = FixPath(filePath);

            var rawresult = await GetDynamicStructureAsync(type, filePath).ConfigureAwait(false);
            var ret = rawresult as IDictionary<string, object>;
            var error = ret["error"];
            if (error != null)
            {
                var errObj = error as IDictionary<string, object>;
                var msg = errObj["message"] + Environment.NewLine + errObj["stack"];
                throw new FormatException(msg);
            }
            var model = ret["model"] as IDictionary<string, object>;
            var webApi = WebApiMapper.Map(model);
            var shapes = ShapeMapper.Map(ret["shapes"] as object[]);
            return new AmfModel(webApi, shapes);
        }

        private static string FixPath(string filePath)
        {
            if (filePath.StartsWith("http:") || filePath.StartsWith("https:"))
                return filePath;

            if (!filePath.StartsWith("file://"))
            {
                if (!File.Exists(filePath))
                    throw new InvalidOperationException("File not found " + filePath);

                var fullPath = Path.GetFullPath(filePath);
                // fullPath = RemoveDriveLetter(fullPath);

                filePath = "file:///" + fullPath;
            }
            else
            {
                if (!File.Exists(filePath.Substring(7)))
                    throw new InvalidOperationException("File not found " + filePath);

                var fullPath = Path.GetFullPath(filePath.Substring(7));
                // fullPath = RemoveDriveLetter(fullPath);

                filePath = "file:///" + fullPath;
            }

            filePath = filePath.Replace("\\", "/");

            return filePath;
        }

        public static async Task<object> GetDynamicStructureAsync(SpecificationType specType, string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("filePath");

            var func = Edge.Func(@"
                return function (input, callback) {
                    var parser = require('parser')
                    parser.parse(input.type, input.file, function(model) { return callback(null, model); });
                }
            ");
            var type = Enum.GetName(typeof(SpecificationType), specType).ToLowerInvariant();
            var input = new { type = type, file = filePath };
            var rawresult = await func(input);
            return rawresult;
        }
    }
}
