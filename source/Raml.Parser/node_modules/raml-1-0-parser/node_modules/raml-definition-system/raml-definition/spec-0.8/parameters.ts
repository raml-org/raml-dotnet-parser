import  MetaModel = require("../metamodel")
import  Sys = require("./systemTypes")
import  Common=require("./common")

var index:MetaModel.SpecPartMetaData={
  title:"Named Parameters"
}

export enum ParameterLocation{
  QUERY,HEADERS,URI,FORM,BURI
}

export class Parameter extends Common.RAMLLanguageElement {
  name:string
  $name=[
    MetaModel.key(),
    MetaModel.description("name of the parameter"),
    MetaModel.extraMetaKey("headers")
  ]

  displayName: string
  $displayName=[
    MetaModel.description("An alternate, human-friendly name for the parameter")
  ]

  type:string;
  $type=[
    MetaModel.defaultValue("string"),
    MetaModel.descriminatingProperty(),
    MetaModel.description("The type attribute specifies the primitive type of the parameter's resolved value. " +
      "API clients MUST return/throw an error if the parameter's resolved value does not match the specified type. " +
      "If type is not specified, it defaults to string."),
    MetaModel.canBeDuplicator()
  ]

  location:ParameterLocation
  $location=[
    MetaModel.system(),
    MetaModel.description("Location of the parameter (can not be edited by user)")
  ]

  required: boolean
  $required=[
    MetaModel.description("Set to true if parameter is required"),
    MetaModel.defaultBooleanValue(true)
  ]

  default:any
  $default=[
    MetaModel.description("The default attribute specifies the default value to use for the property if the property is " +
    "omitted or its value is not specified. This SHOULD NOT be interpreted as a requirement for the client to send the " +
    "default attribute's value if there is no other value to send. Instead, the default attribute's value is the value " +
    "the server uses if the client does not send a value.")
  ]

  example:string
  $example=[
    MetaModel.description("(Optional) The example attribute shows an example value for the property." +
      " This can be used, e.g., by documentation generators to generate sample values for the property.")
  ]

  repeat:boolean
  $repeat=[
    MetaModel.description("The repeat attribute specifies that the parameter can be repeated. If the parameter can be " +
      "used multiple times, the repeat parameter value MUST be set to 'true'. Otherwise, the default value is 'false' and " +
      "the parameter may not be repeated."),
    MetaModel.defaultBooleanValue(false)
  ]
}

export class StringTypeDeclaration extends Parameter {
  type="string"

  $=[
    MetaModel.description("Value must be a string")
  ]

  pattern:string
  $pattern=[
    MetaModel.description("(Optional, applicable only for parameters of type string) The pattern attribute is a regular " +
      "expression that a parameter of type string MUST match. Regular expressions MUST follow the regular expression " +
      "specification from ECMA 262/Perl 5. The pattern MAY be enclosed in double quotes for readability and clarity.")
  ]

  enum:string[]
  $enum=[
      MetaModel.description("(Optional, applicable only for parameters of type string) The enum attribute provides an " +
        "enumeration of the parameter's valid values. This MUST be an array. If the enum attribute is defined, API clients " +
        "and servers MUST verify that a parameter's value matches a value in the enum array. If there is no matching value, " +
        "the clients and servers MUST treat this as an error.")
  ]

  minLength:number
  $minLength=[
      MetaModel.description("(Optional, applicable only for parameters of type string) The minLength attribute specifies " +
        "the parameter value's minimum number of characters.")
  ]

  maxLength:number
  $maxLength=[
    MetaModel.description("(Optional, applicable only for parameters of type string) The maxLength attribute specifies the " +
      "parameter value's maximum number of characters.")
  ]
}

export class BooleanTypeDeclaration extends Parameter {
    type="boolean"

    $=[
      MetaModel.description("Value must be a boolean")
    ]
}

export class NumberTypeDeclaration extends Parameter {
    type="number"

    $=[
      MetaModel.description("Value MUST be a number. Indicate floating point numbers as defined by YAML.")
    ]

    minimum:number
    $minimum=[
      MetaModel.description("(Optional, applicable only for parameters of type number or integer) The minimum attribute " +
        "specifies the parameter's minimum value.")]

    maximum:number
    $maximum=[MetaModel.description("(Optional, applicable only for parameters of type number or integer) The maximum " +
      "attribute specifies the parameter's maximum value.")]
}

export class IntegerTypeDeclaration extends NumberTypeDeclaration {
    type="integer"
    $=[
      MetaModel.description("Value MUST be a integer.")
    ]
}

export class DateTypeDeclaration extends Parameter {
    type="date"
    $=[
      MetaModel.description("Value MUST be a string representation of a date as defined in RFC2616 Section 3.3. "),
    ]
}

export class FileTypeDeclaration extends Parameter {
    type="file"
    $=[
      MetaModel.requireValue("location",ParameterLocation.FORM),
      MetaModel.description("(Applicable only to Form properties) Value is a file. Client generators SHOULD use this type " +
        "to handle file uploads correctly.")
    ]
}

export class HasNormalParameters extends Common.RAMLLanguageElement{
    queryParameters:Parameter[]
    $queryParameters=[
      MetaModel.setsContextValue("location",ParameterLocation.QUERY),
      MetaModel.newInstanceName("New query parameter"),
      MetaModel.description("An APIs resources MAY be filtered (to return a subset of results) or altered (such as transforming " +
        "a response body from JSON to XML format) by the use of query strings. If the resource or its method supports a query " +
        "string, the query string MUST be defined by the queryParameters property")
    ]

    displayName:string
    $displayName=[
      MetaModel.description("An alternate, human-readable name of the object")
    ]

    headers:Parameter[];
    $headers=[
      MetaModel.setsContextValue("location",ParameterLocation.HEADERS),
      MetaModel.description("Headers that allowed at this position"),
      MetaModel.newInstanceName("New Header"),
    ]
}
