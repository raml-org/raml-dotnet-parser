import MetaModel = require("../metamodel")
import DataModel = require("./datamodel")

export class ValueType {

  value():string {
    return null
  }
}

export class StringType extends ValueType {
  $=[
    MetaModel.nameAtRuntime("string"),
    MetaModel.alias("string")
  ]
}
export class AnyType extends ValueType {
  $=[
    MetaModel.nameAtRuntime("any"),
    MetaModel.alias("any")
  ]

}


export class NumberType extends ValueType {
  $=[
    MetaModel.nameAtRuntime("number"),
    MetaModel.alias("integer"),
    MetaModel.alias("number")
  ]
}

export class BooleanType extends ValueType {
  $=[
    MetaModel.nameAtRuntime("boolean"),
    MetaModel.alias("boolean")
  ]
}//FIXME

/**
 * Tag interface, types implementing this interface
 * are counted as global declarations, and their
 * instances may be referred
 */
export interface Referencable<T>{}

export class Reference<T> extends ValueType {
  structuredValue: DataModel.TypeInstance
  $structuredValue=[
    MetaModel.customHandling(),
    MetaModel.description("Returns a structured object if the reference point to one.")
  ]

  name:string
  $name=[
    MetaModel.customHandling(),
    MetaModel.description("Returns name of referenced object")
  ]
}//this is not true ...FIXME

export interface DeclaresDynamicType<T> extends Referencable<T>{}//For now your still required to put declaresSubtype or inlinedTemplates annotation on the classs

export class UriTemplate extends StringType {
  $=[
    MetaModel.description("This type currently serves both for absolute and relative urls")
  ]
}

export class StatusCodeString extends StringType {}

export class RelativeUriString extends UriTemplate {
    $=[
      MetaModel.description("This  type describes relative uri templates")
    ]
}

export class FullUriTemplateString extends UriTemplate {
  $=[
    MetaModel.description("This  type describes absolute uri templates")
  ]

}

export class FixedUriString extends StringType {
  $=[
    MetaModel.description("This  type describes fixed uris")
  ]
}

export class ContentType extends StringType {}



export class MarkdownString extends  StringType{
  $=[
    MetaModel.innerType("markdown"),
    MetaModel.description("[GitHub Flavored Markdown](https://help.github.com/articles/github-flavored-markdown/)")
  ]
}


export class SchemaString extends StringType {
  $=[MetaModel.description("Schema at this moment only two subtypes are supported (json schema and xsd)"),MetaModel.alias("schema")]
}

export class ExampleString extends StringType {
  $=[MetaModel.description("Examples at this moment only two subtypes are supported (json  and xml)")]
}

export class JSonSchemaString extends SchemaString {
  $=[
    MetaModel.innerType("json"),
    MetaModel.description("JSON schema")
  ]
}
export class XMLSchemaString extends SchemaString{
  $=[
    MetaModel.innerType("xsd"),
    MetaModel.description("XSD schema")
  ]
}

