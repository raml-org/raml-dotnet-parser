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
                IsWarning = errorObject.ContainsKey("isWarning") && (bool) errorObject["isWarning"],
                Message = errorObject.ContainsKey("message") ? errorObject["message"] as string : null,
                Path = errorObject.ContainsKey("path") ? errorObject["path"] as string : null,
                Start = GetPosition(errorObject, "start"),
                End = GetPosition(errorObject, "end"),
            };
            return error;
        }

        private static Position GetPosition(IDictionary<string, object> dynamic, string key)
        {
            var result = new Position();

            if (!dynamic.ContainsKey("range"))
                return result;

            var range = dynamic["range"] as IDictionary<string, object>;
            if (range == null) 
                return result;

            if (!range.ContainsKey(key))
                return result;

            var errorObject = range[key] as IDictionary<string, object>;
            if (errorObject == null)
                return result;

            result = new Position
            {
                Line = errorObject.ContainsKey("line") ? errorObject["line"] as int? : null,
                Col = errorObject.ContainsKey("col") ? errorObject["col"] as int? : null,
                Pos = errorObject.ContainsKey("position") ? errorObject["position"] as int? : null,
            };
            return result;
        }

        public string GetMessages()
        {
            if (errors == null)
                GetErrors();

            return errors.Aggregate(string.Empty, (current, error) => current + (GetErrorMessage(error)));
        }

        private static string GetErrorMessage(Error error)
        {
            var message = error.IsWarning ? "Warning: " : "Error: ";
            message += error.Message;
            
            message += GetLineInfo(error, message);

            if (!string.IsNullOrWhiteSpace(error.Path))
                message += " - " + error.Path;

            message += Environment.NewLine;
            return message;
        }

        private static string GetLineInfo(Error error, string message)
        {
            if (message.Contains(" line "))
                return string.Empty;

            if (error.Start.HasValue && error.Start.Line.HasValue && error.End.HasValue && error.End.Line.HasValue &&
                error.Start.Line != error.End.Line)
                return " - start line " + error.Start.Line + " - end line " + error.End.Line + Environment.NewLine;

            if (error.Start.HasValue)
                return message + " - line " + error.Start.Line + Environment.NewLine;

            if (error.End.HasValue)
                return message + " - line " + error.End.Line + Environment.NewLine;

            return string.Empty;
        }
    }
}