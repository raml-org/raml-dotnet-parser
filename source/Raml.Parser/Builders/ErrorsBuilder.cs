using System;
using System.Collections.Generic;
using System.Linq;

namespace Raml.Parser.Builders
{
    public class ErrorsBuilder
    {
        private readonly object[] errorObjects;
        private List<Error> errors;

        public ErrorsBuilder(object[] errorObjects)
        {
            this.errorObjects = errorObjects;
        }

        public IEnumerable<Error> GetErrors()
        {
            errors = (from IDictionary<string, object> errorObject in errorObjects select ParseError(errorObject)).ToList();
            return errors;
        }

        private Error ParseError(IDictionary<string, object> errorObject)
        {
            var error = new Error
            {
                Code = errorObject.ContainsKey("code") ? errorObject["code"] as string : null,
                IsWarning = errorObject.ContainsKey("isWarning") && (bool)errorObject["isWarning"],
                Message = errorObject.ContainsKey("message") ? errorObject["message"] as string : null,
                Path = errorObject.ContainsKey("path") ? errorObject["path"] as string : null,
                Line = errorObject.ContainsKey("line") ? errorObject["line"] as int? : null,
                Col = errorObject.ContainsKey("col") ? errorObject["col"] as int? : null
            };
            return error;
        }

        public string GetMessages()
        {
            if (errors == null)
                GetErrors();

            return errors.Aggregate(string.Empty, (current, error) => current + (GetErrorMessage(error)));
        }

        private static string GetErrorMessage(Error error)
        {
            return (error.IsWarning ? "Warning: " : "Error: " )+ error.Message + Environment.NewLine;
        }
    }
}