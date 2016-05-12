import MetaModel = require("../metamodel")
import Sys = require("./systemTypes")
import DataModel = require("./datamodel")
import Common = require("./common")

export class MimeType extends Sys.StringType {
  $=[MetaModel.description("This sub type of the string represents mime types")]
}

export class Response extends Common.RAMLLanguageElement {
  code:Sys.StatusCodeString
  $code=[
    MetaModel.key(),
    MetaModel.extraMetaKey("statusCodes"),
    MetaModel.description("Responses MUST be a map of one or more HTTP status codes, where each status code itself is a map that " +
      "describes that status code."),
    MetaModel.hide()
  ]

  headers:DataModel.TypeDeclaration[];
  $headers=[
    MetaModel.setsContextValue("fieldOrParam",true),
    MetaModel.setsContextValue("location",DataModel.ModelLocation.HEADERS),
    MetaModel.setsContextValue("locationKind",DataModel.LocationKind.APISTRUCTURE),
    MetaModel.newInstanceName("New Header"),
    MetaModel.description("Detailed information about any response headers returned by this method"),
    MetaModel.valueDescription("Object whose property names are the response header names and whose values describe the values.")
  ]

  body:DataModel.TypeDeclaration[]
  $body=[
    MetaModel.newInstanceName("New Body"),
    MetaModel.description("The body of the response: a body declaration"),
    MetaModel.valueDescription("Object whose properties are either<br>* Media types and whose values are type objects describing " +
      "the request body for that media type, or<br>* a type object describing the request body for the default media type specified " +
      "in the root mediaType property.")
  ]

  $displayName=[
    MetaModel.description("An alternate, human-friendly name for the response")
  ]

  $description=[
    MetaModel.description("A longer, human-friendly description of the response"),
    MetaModel.valueDescription("Markdown string")
  ]

  $annotations=[
    MetaModel.markdownDescription("Annotations to be applied to this response. Annotations are any property whose " +
      "key begins with \"(\" and ends with \")\" and whose name (the part between the beginning and ending parentheses) is a " +
      "declared annotation name.")
  ]
}
