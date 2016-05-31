import MetaModel = require("../metamodel")
import Common = require("./common")

export class ValueType {


}

export class StringType extends ValueType {
  $=[
    MetaModel.nameAtRuntime("string")
  ]

}

export class AnyType extends ValueType {
  $=[
    MetaModel.nameAtRuntime("any")
  ]

}
export class NumberType extends ValueType {
  $=[
    MetaModel.nameAtRuntime("number")
  ]
}

export class BooleanType extends ValueType{
  $=[
    MetaModel.nameAtRuntime("boolean")
  ]
}

/**
 * Tag interface, types implementing this interface
 * are counted as global declarations, and their
 * instances may be referred
 */
export interface Referencable<T>{}

export class Reference<T> extends ValueType {

  structuredValue:TypeInstance
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
export class RelativeUriString extends UriTemplate{
  $=[
    MetaModel.description("This  type describes relative uri templates")
  ]


}
export class FullUriTemplateString extends UriTemplate{
  $=[MetaModel.description("This  type describes absolute uri templates")]


}
export class FixedUri extends StringType{
  $=[
    MetaModel.description("This  type describes fixed uris")
  ]
}

export class MarkdownString extends  StringType{
  $=[
    MetaModel.innerType("markdown"),
    MetaModel.description("Mardown string is a string which can contain markdown as an extension this markdown " +
      "should support links with RAML Pointers since 1.0")
  ]
}

export class SchemaString extends StringType{
  $=[
    MetaModel.description("Schema at this moment only two subtypes are supported (json schema and xsd)")
  ]


}

export class JSonSchemaString extends SchemaString{
  $=[
    MetaModel.functionalDescriminator("this.mediaType&&this.mediaType.isJSON()"),
    MetaModel.description("JSON schema")
  ]
}

export class XMLSchemaString extends SchemaString{
  $=[
    MetaModel.innerType("xml"),
    MetaModel.description("XSD schema")
  ]
}

export class ExampleString extends StringType {}

export class StatusCodeString extends StringType{}

export class JSONExample extends ExampleString {
  $=[
    MetaModel.functionalDescriminator("this.mediaType.isJSON()")
  ]

  $$:any

  
}

export class XMLExample extends ExampleString{
  $=[
    MetaModel.functionalDescriminator("this.mediaType.isXML()")
  ]
}


export class TypeInstance{
  $=[
    MetaModel.customHandling()
  ]

  properties:TypeInstanceProperty[]
  $properties=[
    MetaModel.description("Array of instance properties")
  ]

  isScalar:boolean;
  $isScalar=[
    MetaModel.description("Whether the type is scalar")
  ]

  value:any;
  $value=[
    MetaModel.description("For instances of scalar types returns scalar value")
  ]
}

export class TypeInstanceProperty{

    $=[
      MetaModel.customHandling()
    ]

    name:string
    $name=[
      MetaModel.description("Property name")
    ]

    value:TypeInstance
    $value=[
      MetaModel.description("Property value")
    ]

    values:TypeInstance[]
    $values=[
      MetaModel.description("Array of values if property value is array")
    ]

    isArray:boolean
    $isArray=[
      MetaModel.description("Whether property has array as value")
    ]
}
