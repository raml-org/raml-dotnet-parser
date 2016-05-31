import  MetaModel = require("../metamodel")
import  Sys = require("./systemTypes")
import  Common=require("./common")
import  DataModel=require("./datamodel")

//////////////////////////////////////
// Parameters related declarations
var index:MetaModel.SpecPartMetaData={
  title:"Named Parameters"
}

export class FileTypeDeclaration extends DataModel.TypeDeclaration {
  type="file"

  fileTypes:Sys.ContentType[]
  $fileTypes=[
    MetaModel.description("It should also include a new property: fileTypes, which should be a list of valid content-type " +
      "strings for the file. The file type */* should be a valid value.")
  ]

  minLength:number
  $minLength=[MetaModel.description("The minLength attribute specifies the parameter value's minimum number of bytes.")]

  maxLength:number
  $maxLength=[
    MetaModel.description("The maxLength attribute specifies the parameter value's maximum number of bytes.")
  ]

  $=[
    MetaModel.description("(Applicable only to Form properties) Value is a file. Client generators SHOULD use this type to " +
      "handle file uploads correctly.")
    ]
}

export class HasNormalParameters extends Common.RAMLLanguageElement {
  queryParameters:DataModel.TypeDeclaration[]
  $queryParameters=[
    MetaModel.setsContextValue("fieldOrParam",true),
    MetaModel.setsContextValue("location",DataModel.ModelLocation.QUERY),
    MetaModel.setsContextValue("locationKind",DataModel.LocationKind.APISTRUCTURE),
    MetaModel.newInstanceName("New query parameter"),
    MetaModel.description("An APIs resources MAY be filtered (to return a subset of results) or altered (such as transforming " +
      " a response body from JSON to XML format) by the use of query strings. If the resource or its method supports a query " +
      "string, the query string MUST be defined by the queryParameters property")
  ]

  headers:DataModel.TypeDeclaration[];
  $headers=[
    MetaModel.setsContextValue("fieldOrParam",true),
    MetaModel.setsContextValue("location",DataModel.ModelLocation.HEADERS),
    MetaModel.setsContextValue("locationKind",DataModel.LocationKind.APISTRUCTURE),
    MetaModel.description("Headers that allowed at this position"),
    MetaModel.newInstanceName("New Header")
  ]

  queryString:DataModel.TypeDeclaration
  $queryString=[
    MetaModel.description("Specifies the query string needed by this method. Mutually exclusive with queryParameters.")
  ]
}
