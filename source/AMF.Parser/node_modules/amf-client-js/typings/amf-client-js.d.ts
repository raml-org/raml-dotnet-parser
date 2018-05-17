
declare module "amf-client-js" {

    type URI = string;
    type URL = string;

    namespace model {

        namespace document {

            export interface EncodesModel {
                encodes: model.domain.DomainElement;
                withEncodes(enocdes: model.domain.DomainElement): this;
            }

            export interface DeclaresModel {
                declares: model.domain.DomainElement[]
            }

            export class BaseUnit {
                id : string
                raw: string | null;
                withRaw(raw: string): this;
                references(): BaseUnit[];
                withReferences(newReferences: BaseUnit[]): this
                location: URL;
                withLocation(location: URL): string;
                usage(): string;

                findById(id: URI): model.domain.DomainElement | null;

                findByType(typeId: URI): model.domain.DomainElement[];
            }

            export class Document extends BaseUnit implements EncodesModel, DeclaresModel {
                declares: domain.DomainElement[];
                encodes: domain.DomainElement;
                withEncodes(enocdes: model.domain.DomainElement): this;
            }

            export class Fragment extends BaseUnit implements EncodesModel {
                encodes: model.domain.DomainElement;
                withEncodes(enocdes: model.domain.DomainElement): this;
            }

            export class Module extends BaseUnit implements DeclaresModel {
                declares: domain.DomainElement[];
            }
        }

        namespace domain {

            export class DomainElement {
                customDomainProperties(): CustomDomainProperty[]

                withCustomDomainProperties(customDomainProperties: CustomDomainProperty[]): DomainElement
                _extends: DomainElement[];
                position(): core.parser.Range

                id: URI;

                getId(): URI;

                withId(id: string): this;

                getTypeIds(): URI[];

                getPropertyIds(): URI[];

                getScalarByPropertyId(propertyId: URI): any[]

                getObjectByPropertyId(propertyId: URI): DomainElement[]
            }

            export class DomainEntity extends DomainElement {
              definition: any;
            }

            export class Vocabulary extends DomainEntity {
                constructor(wrapped?: any);

                base(): URI | null;

                withBase(base: URI): this;

                version(): string | null;

                withVersion(version: string): this;

                usage(): string | null;

                withUsage(usage: string): this;

                uses(): VocabularyImport[];

                withUses(imports: VocabularyImport[]): this;

                externals(): ExternalVocabularyImport[];

                withExternals(externalImports: ExternalVocabularyImport[]): this;

                classTerms(): ClassTerm[];

                withClassTerms(classTerms: ClassTerm[]): this;

                propertyTerms(): PropertyTerm[];

                withPropertyTerms(propertyTerms: PropertyTerm[]): this;
            }

            export class ExternalVocabularyImport extends DomainEntity {
                constructor(wrapped?: any);

                name(): string | null;

                withName(name: string): this;

                uri(): string | null;

                withUri(uri: URI): this;
            }

            export class VocabularyImport extends DomainEntity {
                constructor(wrapped?: any);

                name(): string | null;

                withName(name: string): this;

                uri(): string | null;

                withUri(uri: URI): this;
            }

            export class ClassTerm extends DomainEntity {
                getId(): URI;

                withId(id: URI): this;

                displayName(): string | null;

                withDisplayName(displayName: string): this;

                description(): string | null;

                withDescription(description: string): this;

                termExtends(): string[];

                withTermExtends(termExtends: string[]): this

                properties(): string[];

                withProperties(properties: string[]): this;
            }

            export class PropertyTerm extends DomainEntity {
                getId(): URI;

                withId(id: URI): this;

                displayName(): string | null;

                withDisplayName(displayName: string): this;

                description(): string | null;

                withDescription(description: string): this;

                termExtends(): URI[];

                withTermExtends(termExtends: URI[]): this;

                range(): URI[];

                withRange(range: URI[]): this;

                withScalarRange(range: string[]): this;
            }

            export class CustomDomainProperty extends DomainElement {
                name(): string;

                withName(name: string): this;

                displayName(): string;

                withDisplayName(displayName: string): this;

                description(): string;

                withDescription(description: string): this;

                domain(): string;

                withDomain(domain: string): this;

                schema(): Shape;

                withSchema(schema: Shape): this;
            }

            export class Shape extends DomainElement {
                name(): string;

                withName(name: string): this;

                displayName(): string;

                withDisplayName(displayName: string): this;

                default(): string;

                withDefault(defaultValue: string): this;

                values(): string[]

                withValues(values: string[]): this;

                inherits(): Shape[];

                withInherits(baseShapes: Shape[]): this;
                withDefaultStr(value: String): this;
            }

            export class PropertyShape extends Shape {
                pah(): string;

                range(): Shape;
                minCount: number;
                maxCount: number;
                withPath(path: String): this;
                withRange(range: Shape): this;

                withMinCount(minCount: number): this;

                withMaxCount(maxCount: number): this;
            }

            export class AnyShape extends Shape {
                documentation: CreativeWork;
                xmlSerialization: XMLSerializer;
                examples: Example[];
                withDocumentation(documentation: CreativeWork): this;

                withXMLSerialization(xmlSerialization: XMLSerializer): this;

                toJsonSchema: String

                validate(payload: String): Promise<validate.ValidationReport>

                withExamples(examples: Example[]): this;
            }

            export class XMLSerializer extends DomainElement {
                attribute: boolean;
                wrapped: boolean;
                name: string;
                namespace: string;
                prefix: string;
                withAttribute(attribute: boolean): this;

                withWrapped(wrapped: boolean): this;

                withName(name: string): this;

                withNamespace(namespace: string): this;

                withPrefix(prefix: string): this;
            }

            export class ApiKeySettings extends Settings {
                name: string;
                _in: string;
                withName(name: string): this;

                withIn(_in: string): this;
            }

            export class ArrayShape extends DataArrangeShape {
                items: Shape;
                withItems(items: Shape): this;
            }

            export class DataArrangeShape extends AnyShape {
                minItems: number;
                maxItems: number;
                uniqueItems: boolean;
                withMinItems(minItems: number): this;

                withMaxItems(maxItems: number): this;

                withUniqueItems(uniqueItems: boolean): this;
            }

            export class CreativeWork extends DomainElement {
                url: string;
                description: string;
                title: string;
                withUrl(url: string): this;

                withTitle(title: string): this;

                withDescription(description: string): this;
            }

            export class UnionShape extends AnyShape {
                anyOf(): AnyShape[];

                withAnyOf(anyOf: AnyShape[]): this;
            }

            export class RecursiveShape extends DomainElement {
                fixPoint(): string;

                withFixPoint(fixPoint: string): this;
            }

            export class DataNode extends DomainElement {
                name(): string;

                withName(name: string): this;
            }

            export class DomainExtension extends DomainElement {
                name(): string;

                definedBy(): CustomDomainProperty;

                extension(): DataNode;

                withName(name: string): this;

                withDefinedBy(definitor: CustomDomainProperty): this;

                withExtension(extension: DataNode): this;
            }

            export class AbstractDeclaration {
                name(): string;

                dataNode(): DataNode;

                variables(): string[];

                withName(name: string): this;

                withDataNode(dataNode: DataNode): this;

                withVariables(vars: string[]): this;
            }

            export class Trait extends AbstractDeclaration {
            }

            export class ResourceType extends AbstractDeclaration {
            }

            export class ParametrizedDeclaration extends DomainElement {
                name(): string;

                target(): URI;

                variables(): VariableValue[];

                withName(name: string): this;

                withVariables(variables: VariableValue[]): this;

                withTarget(targte: string): this;
            }

            export class Variable extends DomainElement {
                name(): string

                value(): string
            }

            export class VariableValue extends DomainElement {
                name(): string;

                value(): string;

                withName(name: string): this;

                withValue(value: string): this;
            }

            export class EndPoint extends DomainElement {
                name: string;
                description: string;
                path: string;
                operations: Operation[];
                parameters: Parameter[];
                security: ParametrizedSecurityScheme[];
                relativePath: string;
                withName(name: string): this;

                withDescription(description: string): this;

                withPath(path: string): this;

                withOperations(operations: Operation[]): this;

                withParameters(parameters: Parameter[]): this;

                withSecurity(security: ParametrizedSecurityScheme[]): this;

                withOperation(method: string): Operation;

                withParameter(name: string): Parameter;
            }

            export class ParametrizedSecurityScheme extends DomainElement {
                name: string;
                scheme: SecurityScheme;
                settings: Settings;
                withName(name: string): this;

                withScheme(scheme: SecurityScheme): this;

                withSettings(settings: Settings): this;

                withDefaultSettings(): Settings;

                withOAuth1Settings(): OAuth1Settings;

                withOAuth2Settings(): OAuth2Settings;

                withApiKeySettings(): ApiKeySettings;
            }

            export class SecurityScheme extends DomainElement {
                name: string;
                type: string;
                displayName: string;
                description: string;
                headers: Parameter[];
                queryParameters: Parameter[];
                responses: Response[];
                settings: Settings;
                queryString: Shape;
                withName(name: string): this;

                withType(type: string): this;

                withDisplayName(displayName: string): this;

                withDescription(description: string): this;

                withHeaders(headers: Parameter[]): this;

                withQueryParameters(queryParameters: Parameter[]): this;

                withResponses(responses: Response[]): this;

                withSettings(settings: Settings): this;

                withQueryString(queryString: Shape): this;

                withHeader(name: string): Parameter;

                withQueryParameter(name: string): Parameter;

                withResponse(name: string): Response;

                withDefaultSettings(): Settings;

                withOAuth1Settings(): OAuth1Settings;

                withOAuth2Settings(): OAuth2Settings;

                withApiKeySettings(): ApiKeySettings;
            }

            export class ParametrizedResourceType extends ParametrizedDeclaration {
            }

            export class ParametrizeTrait extends ParametrizedDeclaration {
            }

            export class Parameter extends DomainElement {
                name: string;
                description: string;
                required: boolean;
                binding: string;
                schema: Shape;
                withName(name: string): this

                withDescription(description: string): this

                withRequired(required: boolean): this

                withBinding(binding: string): this

                withSchema(schema: Shape): this;

                withObjectSchema(name: string): NodeShape

                withScalarSchema(name: string): ScalarShape
            }

            export class Example extends DomainElement {
                name: string;
                displayName: string;
                description: string;
                value: string;
                strict: boolean;
                mediaType: string;
                structuredValue: DataNode;
                withName(name: string): this;

                withDisplayName(displayName: string): this;

                withDescription(description: string): this;

                withValue(value: string): this;

                withStrict(strict: boolean): this;

                withMediaType(mediaType: string): this;
                withStructuredValue(value: DataNode): this;
            }

            export class FileShape extends AnyShape {
                fileTypes: string[];
                pattern: string;
                minLength: number;
                maxLength: number;
                minimum: string;
                maximum: string;
                exclusiveMinimum: string;
                exclusiveMaximum: string;
                format: string;
                multipleOf: number;
                withFileTypes(fileTypes: string[]): this;

                withPattern(pattern: string): this;

                withMinLength(min: number): this;

                withMaxLength(max: number): this;

                withMinimum(min: string): this;

                withMaximum(max: string): this;

                withExclusiveMinimum(min: string): this;

                withExclusiveMaximum(max: string): this;

                withFormat(format: string): this;

                withMultipleOf(multiple: number): this;
            }

            export class License extends DomainElement {
                url: string;
                name: string;
                withUrl(url: string): this;

                withName(name: string): this;
            }

            export class NilShape extends AnyShape {
            }

            export class NodeShape extends AnyShape {
                minProperties: number;
                maxProperties: number;
                closed: boolean;
                discriminator: string;
                discriminatorValue: string;
                readOnly: boolean;
                properties: PropertyShape[];
                dependencies: PropertyDependencies[];
                withMinProperties(min: number): this;

                withMaxProperties(max: number): this;

                withClosed(closed: boolean): this;

                withDiscriminator(discriminator: string): this;

                withDiscriminatorValue(value: string): this;

                withReadOnly(readOnly: boolean): this;

                withProperties(properties: PropertyShape[]): this;

                withProperty(name: string): PropertyShape;

                withDependencies(dependencies: PropertyDependencies[]): this;

                withDependency(): PropertyDependencies;

                withInheritsObject(name: string): NodeShape;

                withInheritsScalar(name: string): ScalarShape;
            }

            export class PropertyDependencies extends DomainElement {
                propertySource: string;
                propertyTarget: string[];
                withPropertySource(propertySource: string): this;

                withPropertyTarget(propertyTarget: string[]): this;
            }

            export class Request extends DomainElement {
                queryParameters: Parameter[];
                headers: Parameter[];
                payloads: Payload[];
                queryString: Shape;
                withQueryParameters(parameters: Parameter[]): this;

                withHeaders(headers: Parameter[]): this;

                withPayloads(payloads: Payload[]): this;

                withQueryParameter(name: string): Parameter;

                withHeader(name: string): Parameter;

                withPayload(): Payload;
                withPayload(mediaType: string): Payload;

                withQueryString(queryString: Shape): this;
            }

            export class OAuth1Settings extends Settings {
                requestTokenUri: string;
                authorizationUri: string;
                tokenCredentialsUri: string;
                signatures: string[];
                withRequestTokenUri(requestTokenUri: string): this;

                withAuthorizationUri(authorizationUri: string): this;

                withTokenCredentialsUri(tokenCredentialsUri: string): this;

                withSignatures(signatures: string[]): this;
            }

            export class Settings extends DomainElement {
                additionalProperties: DataNode;
                withAdditionalProperties(additionalProperties: DataNode): this;
            }

            export class OAuth2Settings extends Settings {
                authorizationUri: string;
                accessTokenUri: string;
                authorizationGrants: string[];
                flow: string;
                scopes: Scope[];
                withAuthorizationUri(authorizationUri: string): this;

                withAccessTokenUri(accessTokenUri: string): this;

                withAuthorizationGrants(authorizationGrants: string[]): this;

                withFlow(flow: string): this;

                withScopes(scopes: Scope[]): this;
            }

            export class Scope extends DomainElement {
                name: string;
                description: string;
                withName(name: string): this;

                withDescription(description: string): this;
            }

            export class Operation extends DomainElement {
                method: string;
                name: string;
                description: string;
                deprecated: boolean;
                summary: string;
                documentation: CreativeWork;
                schemes: string[];
                accepts: string[];
                contentType: string[];
                request: Request;
                responses: Response[];
                security: DomainElement[];
                withMethod(method: string): this;

                withName(name: string): this;

                withDescription(description: string): this;

                withDeprecated(deprecated: boolean): this;

                withSummary(summary: string): this;

                withDocumentation(documentation: CreativeWork): this;

                withSchemes(schemes: string[]): this;

                withAccepts(accepts: string[]): this;

                withContentType(contentType: string[]): this;

                withRequest(request: Request): this;

                withResponses(responses: Response[]): this;

                withSecurity(security: DomainElement[]): this;

                withResponse(name: string): Response
            }

            export class Response extends DomainElement {
                name: string;
                description: string;
                statusCode: string;
                headers: Parameter[];
                payloads: Payload[];
                examples: Example[];
                withName(name: string): this;

                withDescription(description: string): this;

                withStatusCode(statusCode: string): this;

                withHeaders(headers: Parameter[]): this;

                withPayloads(payloads: Parameter[]): this;

                withExamples(examples: Example[]): this;

                withHeader(name: string): Parameter;

                withPayload(): Payload;
                withPayload(mediaType: string): Payload;
            }

            export class Organization extends DomainElement {
                url: string;
                name: string;
                email: string;
                withUrl(url: string): this;

                withName(name: string): this;

                withEmail(email: string): this;
            }

            export class Payload extends DomainElement {
                mediaType: string;
                schema: Shape;
                withMediaType(mediaType: string): this;

                withSchema(schema: Shape): this;

                withObjectSchema(name: string): NodeShape;

                withScalarSchema(name: string): ScalarShape;
            }

            export class ScalarShape extends AnyShape {
                dataType: string;
                pattern: string;
                minLength: number;
                maxLength: number;
                minimum: string;
                maximum: string;
                exclusiveMinimum: string;
                exclusiveMaximum: string;
                format: string;
                multipleOf: number;
                withDataType(dataType: string): this;

                withPattern(pattern: string): this;

                withMinLength(min: number): this;

                withMaxLength(max: number): this;

                withMinimum(min: string): this;

                withMaximum(max: string): this;

                withExclusiveMinimum(min: string): this;

                withExclusiveMaximum(max: string): this;

                withFormat(format: string): this;

                withMultipleOf(multiple: number): this;
            }

            export class SchemaShape extends AnyShape {
                mediaType: string;
                raw: string;
                withMediatype(mediaType: string): this;

                withRaw(text: string): this;
            }

            export class WebApi extends DomainElement {
                name: string;
                description: string;
                host: string;
                basePath: string;
                version: string;
                termsOfService: string;
                schemes: string[];
                accepts: string[];
                contentType: string[];
                endPoints: EndPoint[];
                provider: Organization;
                license: License;
                documentations: CreativeWork[];
                baseUriParameters: Parameter[];
                security: ParametrizedSecurityScheme[];
                withName(name: string): this;

                withDescription(description: string): this;

                withHost(host: string): this;

                withBasePath(path: string): this;

                withVersion(version: string): this;

                withTermsOfService(terms: string): this;

                withSchemes(schemes: string[]): this;

                withAccepts(accepts: string[]): this;

                withContentType(contentType: string[]): this;

                withEndPoints(endPoints: EndPoint[]): this;

                withProvider(provider: Organization): this;

                withLicense(license: License): this;

                withDocumentation(documentations: CreativeWork[]): this;

                withSecurity(security: ParametrizedSecurityScheme[]): this;

                withDocumentationTitle(title: string): CreativeWork;

                withDocumentationUrl(url: string): CreativeWork;

                withBaseUriParameters(parameters: Parameter[]): this;

                withEndPoint(path: string): EndPoint;

                withBaseUriParameter(name: string): Parameter;
            }
        }
    }

    namespace validate {

        export class ValidationReport {
            conforms: boolean;
            model: string;
            profile: string;
            results: ValidationResult[];
        }

        export class ValidationResult {
            message: string;
            level: string;
            targetNode: URI;
            targetProperty: string | null;
            validationId: string;
            source: any;
            position: core.parser.Range;
        }
    }

    namespace core {

        namespace parser {

            export class Position {
                line: number;
                column: number;
            }

            export class Range {
                start: core.parser.Position;
                end: core.parser.Position;

                toString(): string;
            }
        }

        namespace client {

            export interface JsHandler<T> {
                success(T): void;
                error(Throwable): void;
            }

            export interface StringHandler {
                success(string): void;
                error(Throwable): void;
            }

            export interface FileHandler {
                success(): void;
                error(Throwable): void;
            }

            export class Generator {
                generateFile(unit: model.document.BaseUnit, url: string, handler: FileHandler): void;
                generateString(unit: model.document.BaseUnit, handler: StringHandler): void;
                generateFile(unit: model.document.BaseUnit, url: string): Promise<void>;
                generateString(unit: model.document.BaseUnit): string;
            }

            export class Parser {

                parseFile(url: string, handler: JsHandler<model.document.BaseUnit>): void
                parseString(stream: string, handler: JsHandler<model.document.BaseUnit>): void
                parseFileAsync(url: string): Promise<model.document.BaseUnit>
                parseStringAsync(stream: string): Promise<model.document.BaseUnit>
                reportValidation(profileName: string, messageStyle: string): Promise<validate.ValidationReport>
                reportCustomValidation(profileName: string, customProfilePath: string): Promise<validate.ValidationReport>
            }

            export class Resolver {
                resolve(unit: model.document.BaseUnit): model.document.BaseUnit
            }
        }
    }

    namespace plugins {
        namespace document {

            export class WebApi {
                static register(): any;

                static validatePayload(shape: model.domain.Shape, payload: model.domain.DataNode): Promise<validate.ValidationReport>;
            }

            export class Vocabularies {
                static register(): any
            }
        }
        namespace features {
            export class AMFValidation {
                static register(): any
            }
        }
    }

    export class Core {
        static init(): Promise<any>

        static generator(vendor: string, mediaType: string): render.Renderer

        static resolver(vendor: string): core.client.Resolver

        static parser(vendor: string, mediaType: string): parse.Parser

        static validate(model: model.document.BaseUnit, profileName: string, messageStyle?: string): Promise<validate.ValidationReport>

        static loadValidationProfile(url: string): Promise<string>

        static registerNamespace(alias: string, prefix: string): boolean
    }

    namespace client {
        namespace environment {
            export class Environment {

                constructor();

                loaders: resource.ResourceLoader[]

                add(loader: resource.ResourceLoader): Environment;

                withLoaders(loaders: resource.ResourceLoader[]): Environment

                static empty(): Environment;

                static apply(loader: resource.ResourceLoader): Environment
            }
        }

        namespace remote {
            export class Content {

                constructor(stream: string, url: string);

                constructor(stream: string, url: string, mime: string);
            }
        }

        namespace resolve {
            class Resolver {
                constructor(vendor?: string);

                resolve(unit: model.document.BaseUnit): model.document.BaseUnit
                resolve(unit: model.document.BaseUnit, pipeline: String): model.document.BaseUnit
            }

            class AmfGraphResolver extends Resolver {}

            class Oas20Resolver extends Resolver {}

            class Raml08Resolver extends Resolver {}

            class Raml10Resolver extends Resolver {}
        }

        namespace model {
            namespace document {
                class BaseUnit {}
            }

        }
    }

    namespace resource {
        export interface ResourceLoader {

            fetch(resource: string): Promise<client.remote.Content>

            accepts(resource: string): boolean
        }
    }

    namespace parse {
        export class Parser {
            constructor(vendor: string, mediaType: string);

            constructor(vendor: string, mediaType: string, env: any);

            parseFile(url: string, handler: handler.JsHandler<model.document.BaseUnit>): void

            parseString(stream: string, handler: handler.JsHandler<model.document.BaseUnit>): void

            parseFileAsync(url: string): Promise<model.document.BaseUnit>

            parseStringAsync(url: string, stream: string): Promise<model.document.BaseUnit>

            parseStringAsync(stream: string): Promise<model.document.BaseUnit>

            reportValidation(profileName: string, messageStyle: string): Promise<validate.ValidationReport>

            reportCustomValidation(profileName: string, customProfilePath: string): Promise<validate.ValidationReport>
        }
    }

    namespace handler {
        export interface JsHandler<T> {
            success(t: T): void;

            error(e: any): void;
        }

        export interface StringHandler {
            success(value: string): void;

            error(e: any): void;
        }

        export interface FileHandler {
            success(): void;

            error(e: any): void;
        }
    }

    namespace render {
        class RenderOptions {

            withSourceMaps(): RenderOptions

            withoutSourceMaps(): RenderOptions

            isWithSourceMaps: boolean

            withCompactUris(): RenderOptions

            withoutCompactUris(): RenderOptions

            isWithCompactUris: Boolean

            static apply(): RenderOptions
        }

        export class Renderer {

            constructor(vendor: string, mediaType: string);

            generateFile(unit: model.document.BaseUnit, url: string, handler: handler.FileHandler): void

            generateFile(unit: model.document.BaseUnit, url: string, options: RenderOptions, handler: handler.FileHandler): void

            generateString(unit: model.document.BaseUnit, handler: handler.JsHandler<string>): void

            generateString(unit: model.document.BaseUnit, options: RenderOptions, handler: handler.JsHandler<String>): void

            generateFile(unit: model.document.BaseUnit, url: string): Promise<void>

            generateFile(unit: model.document.BaseUnit, url: string, options: RenderOptions): Promise<void>

            generateString(unit: model.document.BaseUnit): Promise<string>

            generateString(unit: model.document.BaseUnit, options: RenderOptions): Promise<string>
        }

        export class Raml08Renderer extends Renderer {
        }

        export class Raml10Renderer extends Renderer {
        }

        export class Oas20Renderer extends Renderer {
        }

        export class AmfGraphRenderer extends Renderer {
        }

    }

    export class Raml10Parser extends parse.Parser {
        constructor();
        constructor(env: client.environment.Environment);
    }

    export class RamlParser extends parse.Parser {
        constructor();
        constructor(env: client.environment.Environment);
    }

    export class Raml08Parser extends parse.Parser {
        constructor();
        constructor(env: client.environment.Environment);
    }

    export class Oas20Parser extends parse.Parser {
        constructor();
        constructor(env: client.environment.Environment);
    }

    export class VocabulariesParser extends parse.Parser {
        constructor();
        constructor(env: client.environment.Environment);
     }

    export class JsonPayloadParser extends parse.Parser {
        constructor();
        constructor(env: client.environment.Environment);
    }

    export class YamlPayloadParser extends parse.Parser {
        constructor();
        constructor(env: client.environment.Environment);
    }

    export class JsonldRenderer extends render.Renderer {
        constructor();
    }

    export class AMF {
        static init(): Promise<void>

        static raml10Parser(): Raml10Parser

        static ramlParser(): RamlParser

        static raml10Generator(): render.Raml10Renderer

        static raml08Parser(): Raml08Parser

        static raml08Generator(): render.Raml08Renderer

        static oas20Parser(): Oas20Parser

        static oas20Generator(): render.Oas20Renderer

        // static amfGraphParser(): AmfGraphParser

        static amfGraphGenerator(): render.AmfGraphRenderer

        static validate(model: model.document.BaseUnit, profileName: string, messageStyle: string): Promise<validate.ValidationReport>

        static loadValidationProfile(url: string): Promise<string>

        static registerNamespace(alias: string, prefix: string): boolean

        // static registerDialect(url: string): Promise<Dialect>

        static resolveRaml10(unit: model.document.BaseUnit): model.document.BaseUnit

        static resolveRaml08(unit: model.document.BaseUnit): model.document.BaseUnit

        static resolveOas20(unit: model.document.BaseUnit): model.document.BaseUnit

        static resolveAmfGraph(unit: model.document.BaseUnit): model.document.BaseUnit

        static jsonPayloadParser(): JsonPayloadParser

        static yamlPayloadParser(): YamlPayloadParser
    }

}