using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EdgeJs;
using Raml.Parser.Builders;
using Raml.Parser.Expressions;
using System.IO;

namespace Raml.Parser
{
    public class RamlParser
    {
        public async Task<RamlDocument> LoadAsync(string filePath)
        {
            var rawresult = await GetDynamicStructure(filePath);

            var ramlDocument = await new RamlBuilder().Build((IDictionary<string, object>)rawresult, filePath);

            return ramlDocument;
        }

        public static async Task<object> GetDynamicStructure(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("filePath");

            var load = Edge.Func(@"

                return function (filepath, callback) {

                    var raml1Parser = require('raml-1-0-parser');
                    var path = require('path');

                    var api = raml1Parser.loadApiSync(filepath);
             
                    var errors = '';
                
                    var isError = false;
                
                    for (var i = 0; i < api.errors().length; i++) {
                    
                        if (!api.errors()[i].isWarning)
                            isError = true;
                    
                        errors += (api.errors()[i].isWarning ? 'Warning: ' : 'Error: ') + api.errors()[i].message + '\r\n';
                        errors += 'Line: ' + api.errors()[i].line + ', column: ' + api.errors()[i].column;
                        if (api.errors()[i].path != null)
                            errors += ', ' + api.errors()[i].path + '\r\n';
                        else
                            errors += '\r\n';

                        errors += '\r\n';
                    }

                    if (isError)
                        callback(null, 'Error: when parsing.\r\n\r\n' + errors);
                    else
                        callback(null, api.toJSON())

                }
            ");

            var rawresult = await load(filePath);
            var error = rawresult as string;
            if (!string.IsNullOrWhiteSpace(error) && error.ToLowerInvariant().Contains("error"))
                throw new FormatException(error);
            return rawresult;
        }

        public async Task<RamlDocument> LoadAsync(string filePath, string[] extensionPaths)
        {
            if (string.IsNullOrWhiteSpace(filePath))
                throw new ArgumentException("filePath");

            var load = Edge.Func(@"

                function position(pos, positions) {

                    var row = -1;
                    var col = -1;
                    for (var i = 0; i < positions.length; i++) {
                        if (positions[i] >= pos) {
                            row = i + 1;
                            col = positions[i-1] - pos;
                            return { row: row, col: col };
                        }
                    }
                    return { row: row, col: col };
                }

                return function (obj, callback) {

                    var raml1Parser = require('raml-1-0-parser');
                    var path = require('path');

                    var api = raml1Parser.loadApiSync(obj.Filepath, obj.Extensions);

	                var fs = require('fs');

                    var arr = [];
                    var content = fs.readFileSync(obj.Filepath).toString();
                    content.split('\n').forEach(function (x, i) {
                        if (i == 0) {
                            arr.push(x.length + 1);
                        } else {
                            arr.push(arr[i - 1] + x.length + 1);
                        }
                    }); //+1 stands for '\n'    
                
                    var errors = '';
                
                    var isError = false;
                
                    for (var i = 0; i < api.errors().length; i++) {
                    
                        var pos = position(api.errors()[i].start, arr);
                    
                        if (!api.errors()[i].isWarning)
                            isError = true;
                    
                        errors += (api.errors()[i].isWarning ? 'Warning: ' : 'Error: ') + api.errors()[i].message + '\r\n';
                        errors += 'Start: ' + api.errors()[i].start + ' - end: ' + api.errors()[i].end + '\r\n';
                        errors += 'Line: ' + pos.row + ', col: ' + pos.col + '\r\n';
                        if (api.errors()[i].path != null)
                            errors += 'In: ' + api.errors()[i].path + '\r\n';
                    }

                    if (isError)
                        callback(null, 'Error: when parsing.\r\n' + errors);
                    else
                        callback(null, api.toJSON())

                }
            ");

            var rawresult = await load(new { Filepath = filePath, Extensions = extensionPaths });
            var error = rawresult as string;
            if (!string.IsNullOrWhiteSpace(error) && error.ToLowerInvariant().Contains("error"))
                throw new FormatException(error);

            var ramlDocument = await new RamlBuilder().Build((IDictionary<string, object>)rawresult, filePath);

            return ramlDocument;
        }
    }
}
