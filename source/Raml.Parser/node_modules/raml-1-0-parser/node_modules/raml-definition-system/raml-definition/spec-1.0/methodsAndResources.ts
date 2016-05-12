import MetaModel = require("../metamodel")
import Sys = require("./systemTypes")
import Params=require("./parameters")
import Bodies=require("./bodies")
import Common=require("./common")
import Declarations=require("./declarations")
import DataModel=require("./datamodel")
import Api = require("./api")

///////////////////
//// Security Scheme
//////////////////

export class SecuritySchemePart extends MethodBase {
  $headers=[
    MetaModel.markdownDescription("Optional array of headers, documenting the possible headers that could be accepted."),
    MetaModel.valueDescription("Object whose property names are the request header names and whose values describe the values.")
  ]

  $queryParameters=[
    MetaModel.markdownDescription("Query parameters, used by the scheme in order to authorize the request. Mutually exclusive with queryString."),
    MetaModel.valueDescription("Object whose property names are the query parameter names and whose values describe the values.")
  ]

  $queryString=[
    MetaModel.description("Specifies the query string, used by the scheme in order to authorize the request. Mutually exclusive with queryParameters."),
    MetaModel.valueDescription("Type name or type declaration")
  ]

  $responses=[
    MetaModel.description("Optional array of responses, describing the possible responses that could be sent.")
  ]

  $is=[
    MetaModel.hide()
  ]

  $securedBy=[
    MetaModel.hide()
  ]

  $displayName=[
    MetaModel.description("An alternate, human-friendly name for the security scheme part")
  ]

  $description=[
      MetaModel.description("A longer, human-friendly description of the security scheme part"),
      MetaModel.valueDescription("Markdown string")
  ]

  $annotations=[
    MetaModel.description("Annotations to be applied to this security scheme part. Annotations are any property whose " +
      "key begins with \"(\" and ends with \")\" and whose name (the part between the beginning and ending parentheses) is " +
      "a declared annotation name.")
  ]
}

export class SecuritySchemeSettings {
  $=[
    MetaModel.allowAny()
  ]
}

export class OAuth1SecuritySchemeSettings extends SecuritySchemeSettings {
  $=[
    MetaModel.allowAny(),
    MetaModel.functionalDescriminator("$parent.type=='OAuth 1.0'")
  ]

  requestTokenUri:Sys.FixedUriString
  $requestTokenUri=[
    MetaModel.required(),
    MetaModel.description("The URI of the Temporary Credential Request endpoint as defined in RFC5849 Section 2.1"),
    MetaModel.valueDescription("FixedUriString")
  ]

  authorizationUri:Sys.FixedUriString
  $authorizationUri=[
    MetaModel.required(),
    MetaModel.description("The URI of the Resource Owner Authorization endpoint as defined in RFC5849 Section 2.2"),
    MetaModel.valueDescription("FixedUriString")
  ]

  tokenCredentialsUri:Sys.FixedUriString
  $tokenCredentialsUri=[
    MetaModel.required(),
    MetaModel.description("The URI of the Token Request endpoint as defined in RFC5849 Section 2.3"),
    MetaModel.valueDescription("FixedUriString")
  ]

  signatures:string[]
  $signatures=[
    MetaModel.oneOf(["HMAC-SHA1","RSA-SHA1","PLAINTEXT"]),
    MetaModel.hide(),
    MetaModel.description("List of the signature methods used by the server. Available methods: HMAC-SHA1, RSA-SHA1, PLAINTEXT")
  ]
}

export class OAuth2SecuritySchemeSettings extends SecuritySchemeSettings {
  $=[
    MetaModel.allowAny()
  ]

  accessTokenUri:Sys.FixedUriString
  $accessTokenUri=[
    MetaModel.required(),
    MetaModel.description("The URI of the Token Endpoint as defined in RFC6749 Section 3.2. Not required forby implicit grant type."),
    MetaModel.valueDescription("FixedUriString")
  ]

  authorizationUri:Sys.FixedUriString
  $authorizationUri=[
    MetaModel.required(),
    MetaModel.description("The URI of the Authorization Endpoint as defined in RFC6749 Section 3.1. Required forby authorization_code and implicit grant types."),
    MetaModel.valueDescription("FixedUriString")
  ]

  authorizationGrants:string[]
  $authorizationGrants=[
    MetaModel.required(),
    MetaModel.description("A list of the Authorization grants supported by the API as defined in RFC6749 Sections 4.1, 4.2, 4.3 and " +
      "4.4, can be any of: authorization_code, password, client_credentials, implicit, or refresh_token."),
    MetaModel.markdownDescription("A list of the Authorization grants supported by the API as defined in RFC6749 Sections " +
      "4.1, 4.2, 4.3 and 4.4, can be any of:<br>* authorization_code<br>* password<br>* client_credentials<br>* implicit " +
      "<br>* refresh_token.")
  ]

  scopes:string[]
  $scopes=[
    MetaModel.description("A list of scopes supported by the security scheme as defined in RFC6749 Section 3.3")
  ]
}

export class PassThroughSecuritySchemeSettings extends SecuritySchemeSettings {
  $=[
    MetaModel.allowAny()
  ]

  queryParameterName:string
  $queryParameterName=[
    MetaModel.description("Name of query parameter used to pass key")
  ]

  headerName:string
  $headerName=[
    MetaModel.description("Name of header used to pass key")
  ]
}

export class SecuritySchemeRef extends Sys.Reference<AbstractSecurityScheme>{
  securitySchemeName:string
  $securitySchemeName=[
    MetaModel.customHandling(),
    MetaModel.description("Returns the name of security scheme, this reference refers to.")
  ]

  securityScheme:AbstractSecurityScheme
  $securityScheme=[
    MetaModel.customHandling(),
    MetaModel.description("Returns AST node of security scheme, this reference refers to, or null.")
  ]
}

export class AbstractSecurityScheme extends Common.RAMLLanguageElement implements Sys.Referencable<AbstractSecurityScheme> {
  $=[
    MetaModel.description("Declares globally referable security scheme definition"),
    MetaModel.actuallyExports("$self"),
    MetaModel.referenceIs("settings")
  ]

  name:string
  $name=[
    MetaModel.key(),
    MetaModel.startFrom(""),
    MetaModel.hide(),
    MetaModel.description("Name of the security scheme")
  ]

  type:string
  $type=[
    MetaModel.required(),
    MetaModel.oneOf(["OAuth 1.0","OAuth 2.0","Basic Authentication","Digest Authentication","Pass Through","x-{other}"]),
    MetaModel.descriminatingProperty(),//FIXME (we need more clear connection with SecuritySchemeType)
    MetaModel.description("The securitySchemes property MUST be used to specify an API's security mechanisms, including the required settings and the authentication methods that the API supports. one authentication method is allowed if the API supports them."),
    MetaModel.valueDescription("string<br><br>The value MUST be one of<br>* OAuth 1.0,<br>* OAuth 2.0,<br>* BasicSecurityScheme Authentication<br>* DigestSecurityScheme Authentication<br>* Pass Through<br>* x-&lt;other&gt;")
  ]

  description:Sys.MarkdownString;
  $description=[
    MetaModel.description("The description attribute MAY be used to describe a security schemes property."),
    MetaModel.description("The description MAY be used to describe a securityScheme.")
  ]

  describedBy:SecuritySchemePart;
  $describedBy=[
    MetaModel.description("A description of the request components related to Security that are determined by the scheme: " +
      "the headers, query parameters or responses. As a best practice, even for standard security schemes, API designers SHOULD " +
      "describe these properties of security schemes. Including the security scheme description completes an API documentation.")
  ]

  settings:SecuritySchemeSettings;
  $settings=[
    MetaModel.description("The settings attribute MAY be used to provide security scheme-specific information. The required " +
      "attributes vary depending on the type of security scheme is being declared. It describes the minimum set of properties " +
      "which any processing application MUST provide and validate if it chooses to implement the security scheme. Processing " +
      "applications MAY choose to recognize other properties for things such as token lifetime, preferred cryptographic algorithms, " +
      "and more.")
    ]
}

class OAuth2SecurityScheme extends AbstractSecurityScheme {
  type="OAuth 2.0"

  settings:OAuth2SecuritySchemeSettings

  $=[
    MetaModel.description("Declares globally referable security scheme definition"),
    MetaModel.actuallyExports("$self"),
    MetaModel.referenceIs("settings")
  ]
}

class OAuth1SecurityScheme extends AbstractSecurityScheme {
  type="OAuth 1.0"

  $=[
    MetaModel.description("Declares globally referable security scheme definition"),
    MetaModel.actuallyExports("$self"),
    MetaModel.referenceIs("settings")]

  settings: OAuth1SecuritySchemeSettings
}

class PassThroughSecurityScheme extends AbstractSecurityScheme {
  type="Pass Through"

  settings:PassThroughSecuritySchemeSettings

  $=[
    MetaModel.description("Declares globally referable security scheme definition"),
    MetaModel.actuallyExports("$self"),
    MetaModel.referenceIs("settings")
  ]
}

class BasicSecurityScheme extends AbstractSecurityScheme {
  type="Basic Authentication"
  $=[
    MetaModel.description("Declares globally referable security scheme definition"),
    MetaModel.actuallyExports("$self"),
    MetaModel.referenceIs("settings")
  ]
}

class DigestSecurityScheme extends AbstractSecurityScheme {
  type="Digest Authentication"
  $=[
    MetaModel.description("Declares globally referable security scheme definition"),
    MetaModel.actuallyExports("$self"),
    MetaModel.referenceIs("settings")
  ]
}

class CustomSecurityScheme extends AbstractSecurityScheme {
  type="x-{other}"
  $=[
    MetaModel.description("Declares globally referable security scheme definition"),
    MetaModel.actuallyExports("$self"),
    MetaModel.referenceIs("settings")
  ]
}

///////////////////
//// Trait
//////////////////

export class TraitRef extends Sys.Reference<Trait>{
  trait:Trait
  $trait=[
    MetaModel.customHandling(),
    MetaModel.description("Returns referenced trait")
  ]
}

export class Trait extends MethodBase implements Sys.DeclaresDynamicType<Trait>{
  name:string
  $name=[MetaModel.key(),MetaModel.description("Name of the trait")]

  usage:string
  $usage = [ MetaModel.description("Instructions on how and when the trait should be used.") ]

  $=[MetaModel.inlinedTemplates(),MetaModel.allowQuestion()]

  uses:Api.Library[];
  $uses=[
    MetaModel.embeddedInMaps(),
    MetaModel.description("You may import library locally here it contents is accessible only inside of this trait"),
    MetaModel.setsContextValue("decls","true"),
    MetaModel.valueDescription("An array of libraries or a single library")
  ]

  parametrizedProperties:DataModel.TypeInstance
  $parametrizedProperties = [
    MetaModel.customHandling(),
    MetaModel.description("Returns object representation of parametrized properties of the trait")
  ]
}

///////////////////
//// Resource Type
//////////////////

export class ResourceTypeRef extends Sys.Reference<ResourceType>{
  resourceType:ResourceType
  $resourceType=[
    MetaModel.customHandling(),
    MetaModel.description("Returns referenced resource type")
  ]
}

export class ResourceType extends ResourceBase implements Sys.DeclaresDynamicType<ResourceType> {
  $=[MetaModel.inlinedTemplates(),MetaModel.allowQuestion()]

  name:string
  $name=[
    MetaModel.key(),
    MetaModel.description("Name of the resource type")
  ]

  usage:string
  $usage=[
    MetaModel.description("Instructions on how and when the resource type should be used.")
  ]

  uses:Api.Library[];
  $uses=[
    MetaModel.embeddedInMaps(),
    MetaModel.description("You may import library locally here it contents is accessible only inside of this resource type"),
    MetaModel.setsContextValue("decls","true"),
    MetaModel.valueDescription("An array of libraries")
  ]

  parametrizedProperties:DataModel.TypeInstance
  $parametrizedProperties = [
    MetaModel.customHandling(),
    MetaModel.description("Returns object representation of parametrized properties of the resource type")
  ]
}

///////////////////
//// Resource
//////////////////

export class ResourceBase extends Common.RAMLLanguageElement {
  methods:Method[];
  $methods=[
    MetaModel.description("Methods that are part of this resource type definition"),
    //MetaModel.issue("definition system did not represents that ? is allowed after method names here"),
    MetaModel.markdownDescription("The methods available on this resource."),
    MetaModel.documentationTableLabel("get?<br>patch?<br>put?<br>post?<br>delete?<br>options?<br>head?<br>trace?<br>connect?"),
    MetaModel.valueDescription("Object describing the method")
  ]

  is:TraitRef[]
  $is=[
    MetaModel.description("A list of the traits to apply to all methods declared (implicitly or explicitly) for this resource. Individual methods may override this declaration"),
    MetaModel.valueDescription("array, which can contain each of the following elements:<br>* name of unparametrized trait " +
      "<br>* a key-value pair with trait name as key and a map of trait parameters as value<br>* inline trait declaration " +
      "<br><br>(or a single element of any above kind)")
  ]

  type:ResourceTypeRef
  $type=[
    MetaModel.description("The resource type which this resource inherits."),
    MetaModel.valueDescription("one of the following elements:<br>* name of unparametrized resource type<br>* a key-value pair " +
      "with resource type name as key and a map of its parameters as value<br>* inline resource type declaration")
  ]

  //TODO FIXME
  securedBy:SecuritySchemeRef[]
  $securedBy=[
    MetaModel.allowNull(),
    MetaModel.description("The security schemes that apply to all methods declared (implicitly or explicitly) for this resource."),
    MetaModel.valueDescription("array of security scheme names or a single security scheme name")
  ]


  uriParameters:DataModel.TypeDeclaration[]
  $uriParameters=[
    MetaModel.setsContextValue("location",DataModel.ModelLocation.URI),
    MetaModel.setsContextValue("locationKind",DataModel.LocationKind.APISTRUCTURE),
    MetaModel.setsContextValue("fieldOrParam",true),
    MetaModel.description("Detailed information about any URI parameters of this resource"),
    MetaModel.valueDescription("object whose property names are the URI parameter names and whose values describe the values")
  ]
}

export class Resource extends ResourceBase {
  relativeUri:Sys.RelativeUriString
  $relativeUri=[MetaModel.key(),
    MetaModel.startFrom("/"),
    MetaModel.description("Relative URL of this resource from the parent resource"),
    MetaModel.hide()
  ]

  resources:Resource[];
  $resources=[
    MetaModel.newInstanceName("New Resource"),
    MetaModel.description("A nested resource is identified as any property whose name begins with a slash (\"/\") and is therefore " +
      "treated as a relative URI."),
    MetaModel.documentationTableLabel("/&lt;relativeUri&gt;"),
    MetaModel.valueDescription("object describing the nested resource")
  ]

  $displayName=[
    MetaModel.description("An alternate, human-friendly name for the resource.")
  ]

  $description=[
    MetaModel.description("A longer, human-friendly description of the resource."),
    MetaModel.valueDescription("Markdown string")
  ]

  $annotations=[
    MetaModel.markdownDescription("Annotations to be applied to this resource. Annotations are any property whose key begins " +
      "with \"(\" and ends with \")\" and whose name (the part between the beginning and ending parentheses) is a declared " +
      "annotation name.")
  ]
}

///////////////////
//// Method
//////////////////

export class MethodBase extends Params.HasNormalParameters{
  responses:Bodies.Response[]
  $responses=[
    MetaModel.setsContextValue("response","true"),
    MetaModel.newInstanceName("New Response"),
    MetaModel.description("Information about the expected responses to a request"),
    MetaModel.valueDescription("An object whose keys are the HTTP status codes of the responses and whose values describe the responses.")
  ]

  body:DataModel.TypeDeclaration[]
  $body=[
    MetaModel.newInstanceName("New Body"),
    MetaModel.description("Some method verbs expect the resource to be sent as a request body. For example, to create a resource, " +
      "the request must include the details of the resource to create. Resources CAN have alternate representations. For example, " +
      "an API might support both JSON and XML representations. A method's body is defined in the body property as a hashmap, in " +
      "which the key MUST be a valid media type.")
  ]

  protocols:string[]
  $protocols=[MetaModel.oneOf(["HTTP","HTTPS"]),
    //MetaModel.issue("Not clear how it should work in combination with baseUri also is it also related to resources and types/traits"),MetaModel.needsClarification("Actually it is a set"),
    MetaModel.description("A method can override the protocols specified in the resource or at the API root, by employing this property."),
    MetaModel.valueDescription("array of strings of value HTTP or HTTPS, or a single string of such kind, case-insensitive")
  ]


  is:TraitRef[]
  $is=[MetaModel.description("Instantiation of applyed traits")]

  securedBy:SecuritySchemeRef[]
  $securedBy=[
    MetaModel.allowNull(),
    MetaModel.description("securityScheme may also be applied to a resource by using the securedBy key, which is equivalent " +
      "to applying the securityScheme to all methods that may be declared, explicitly or implicitly, by defining the resourceTypes " +
      "or traits property for that resource. To indicate that the method may be called without applying any securityScheme, the " +
      "method may be annotated with the null securityScheme.")
  ]
}

export class Method extends MethodBase {
  method:string;
  $method=[MetaModel.key(),
    MetaModel.extraMetaKey("methods"),
    MetaModel.oneOf(["get","put","post","delete","options","head","patch","trace","connect"]),
    MetaModel.description("Method that can be called"),
    MetaModel.hide()
  ]

  $displayName=[
    MetaModel.description("An alternate, human-friendly name for the method (in the resource's context).")
  ]

  $description=[
    MetaModel.description("A longer, human-friendly description of the method (in the resource's context)"),
    MetaModel.valueDescription("Markdown string")
  ]

  $queryString=[
    MetaModel.description("Specifies the query string needed by this method. Mutually exclusive with queryParameters."),
    MetaModel.valueDescription("Type name or type declaration")
  ]

  $queryParameters=[
    MetaModel.description("Detailed information about any query parameters needed by this method. Mutually exclusive with queryString."),
    MetaModel.valueDescription("Object whose property names are the query parameter names and whose values describe the values.")
  ]

  $headers=[
    MetaModel.description("Detailed information about any request headers needed by this method."),
    MetaModel.valueDescription("Object whose property names are the request header names and whose values describe the values.")
  ]

  $body=[
    MetaModel.description("Some methods admit request bodies, which are described by this property."),
    MetaModel.valueDescription("Object whose properties are either<br>1) media types and whose values are type objects describing " +
      "the request body for that media type, or<br>2) a type object describing the request body for the default media type specified " +
      "in the root mediaType property")
  ]

  $is=[
    MetaModel.description("A list of the traits to apply to this method."),
    MetaModel.valueDescription("array, which can contain each of the following elements:<br>* name of unparametrized trait " +
      "<br>* a key-value pair with trait name as key and a map of trait parameters as value<br>* inline trait declaration " +
      "<br><br>(or a single element of any above kind)")
  ]

  $annotations=[
    MetaModel.markdownDescription("Annotations to be applied to this method. Annotations are any property whose key " +
      "begins with \"(\" and ends with \")\" and whose name (the part between the beginning and ending parentheses) is a " +
      "declared annotation name.")
  ]

  $securedBy=[
    MetaModel.description("The security schemes that apply to this method"),
    MetaModel.valueDescription("Array of security scheme names or a  single security scheme name")
  ]
}

///////////////////
//// Others
//////////////////

export class ResourceTypeOrTrait {
  usage:string
  $usage=[
    MetaModel.description("Instructions on how and when to use this resource type in a RAML spec"),
    MetaModel.valueDescription("Markdown string")
  ]

  uses:Api.Library[];
  $uses=[
    MetaModel.embeddedInMaps(),
    MetaModel.description("You may import library locally here it contents is accessible only inside of this trait"),
    MetaModel.valueDescription("An array of libraries")
  ]

  parameters:string[]
  $parameters=[
    MetaModel.description("Optional declaration of the parameters that the resource type employs."),
    MetaModel.valueDescription("An object whose property names are the parameter names and whose property values describe the parameter data types.")
  ]
}
