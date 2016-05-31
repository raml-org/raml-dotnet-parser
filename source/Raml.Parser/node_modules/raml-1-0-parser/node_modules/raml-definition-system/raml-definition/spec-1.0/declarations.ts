import  MetaModel = require("../metamodel")
import  Sys = require("./systemTypes")
import  DataModel=require("./datamodel")
import  Common=require("./common")

export class AnnotationTypeDeclaration extends DataModel.TypeDeclaration implements Sys.DeclaresDynamicType<AnnotationTypeDeclaration> {

  //On the design level every annotation usage is instantiation of subclass of particular AnnotationTypeDeclaration
  //on the runtime level it is just Annotation (which is abstract on  the design level)
  //this inheritance strangeness happens because we do not want bring AnnotationTypeDeclaration fields to Annotation
  //TODO think about it
  $=[
    MetaModel.declaresSubTypeOf("Annotation"),
    MetaModel.declaresSubTypeOf("AnnotationTypeDeclaration")
  ]

  allowedTargets:AnnotationTarget[]
  $allowedTargets=[
    MetaModel.oneOf([
      "API",
      "DocumentationItem",
      "Resource",
      "Method",
      "Response",
      "RequestBody",
      "ResponseBody",
      "TypeDeclaration",
      "NamedExample",
      "ResourceType",
      "Trait",
      "SecurityScheme",
      "SecuritySchemeSettings",
      "AnnotationTypeDeclaration",
      "Library",
      "Overlay",
      "Extension"
    ]),
    MetaModel.description("Restrictions on where annotations of this type can be applied. If this property is specified, " +
      "annotations of this type may only be applied on a property corresponding to one of the target names specified as the " +
      "value of this property."),
    MetaModel.valueDescription("An array, or single, of names allowed target nodes.")
  ]

  usage:string
  $usage=[
    MetaModel.description("Instructions on how and when to use this annotation in a RAML spec."),
    MetaModel.valueDescription("Markdown string")
  ]
}

export class AnnotationRef extends Sys.Reference<AnnotationTypeDeclaration> {
  // TODO: this should have more info on Annotations and their usage
  $=[
    MetaModel.description("Annotations allow you to attach information to your API"),
    MetaModel.tags(['annotations'])
  ]

  annotation:AnnotationTypeDeclaration
  $annotation=[
    MetaModel.customHandling(),
    MetaModel.description("Returns referenced annotation")
  ]
}

export class AnnotationTarget extends Sys.ValueType{
  $=[
    // TODO: enum
    MetaModel.description("Elements to which this Annotation can be applied (enum)"),
    MetaModel.tags(['annotations'])
  ]
}

//This type does not exist on RAML design level (basically it's design level counter part is AnnotationRef)
export class Annotation<T> {
  name:string
  $name=[MetaModel.key()]
}

export class ArrayAnnotationTypeDeclaration extends DataModel.ArrayTypeDeclaration {
  $ = [
    MetaModel.superclasses(["AnnotationTypeDeclaration"])
  ]
}

export class UnionAnnotationTypeDeclaration extends DataModel.UnionTypeDeclaration {
  $ = [
    MetaModel.superclasses(["AnnotationTypeDeclaration"])
  ]
}

export class ObjectAnnotationTypeDeclaration extends DataModel.ObjectTypeDeclaration {
  $ = [
    MetaModel.superclasses(["AnnotationTypeDeclaration"])
  ]
}

export class StringAnnotationTypeDeclaration extends DataModel.StringTypeDeclaration {
    $ = [
      MetaModel.superclasses(["AnnotationTypeDeclaration"])
    ]
}

export class BooleanAnnotationTypeDeclaration extends DataModel.BooleanTypeDeclaration {
  $ = [
    MetaModel.superclasses(["AnnotationTypeDeclaration"])
  ]
}



export class NumberAnnotationTypeDeclaration extends DataModel.NumberTypeDeclaration {
  $ = [
    MetaModel.superclasses(["AnnotationTypeDeclaration"])
  ]
}



export class DateTypeAnnotationDeclaration extends DataModel.DateTypeDeclaration {
  $ = [
    MetaModel.superclasses(["AnnotationTypeDeclaration"])
  ]
}
