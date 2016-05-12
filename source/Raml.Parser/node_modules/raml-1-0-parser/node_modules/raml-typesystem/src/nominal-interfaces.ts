export interface INamedEntity{
    nameId():string;
    description():string;
    getAdapter<T>(adapterType:{ new(arg?:any): T ;}):T
    annotations():IAnnotation[]
    addAnnotation(a:IAnnotation):void;
    removeAnnotation(a:IAnnotation):void;

}
export interface NamedId{
    name:string;
}
export interface ITyped{
    getType():ITypeDefinition;
}
export interface IAnnotation extends INamedEntity,ITyped{
    /***
     * names of the parameters that are specified here
     */
    parameterNames(): string[]
    /**
     * value of the parameter with name
     * @param name
     */
    parameter(name:string):any

}

export interface IPrintDetailsSettings {
    hideProperties?: boolean
    hideSuperTypeProperties? : boolean
    printStandardSuperclasses? : boolean
}



export interface IExpandableExample {

    /**
     * Returns true if the application in question does not have an example set directly.
     * It is still possible that while application has no direct example, references may have
     * example pieces, current example may be expanded with.
     */
    isEmpty() : boolean;

    /**
     * Whether the original example is JSON string.
     */
    isJSONString() : boolean;

    /**
     * Whether the original example is XML string.
     */
    isXMLString() : boolean;

    /**
     * Whether original example is set up as YAML.
     */
    isYAML() : boolean;

    /**
     * Returns representation of this example as a string.
     * This method works for any type of example.
     */
    asString() : string;

    /**
     * Returns representation of this example as JSON object.
     * This works for examples being JSON strings and YAML objects.
     * It -may- work for XML string examples, but is not guaranteed.
     */
    asJSON() : any;

    /**
     * Returns an original example. It is string for XML and JSON strings,
     * or JSON object for YAML example.
     */
    original() : any;

    /**
     * Expands the example with what its application references can provide.
     * XML examples are not guaranteed to be supported. If supported, XML is convrted into JSON.
     * Returns null or expansion result as string.
     */
    expandAsString() : string;

    /**
     * Expands the example with what its application references can provide.
     * XML examples are not guaranteed to be supported. If supported, XML is convrted into JSON.
     * Returns null or expansion result as JSON object.
     */
    expandAsJSON() : any;
}
export class ValueRequirement{
    /**
     *
     * @param name name of the property to discriminate
     * @param value expected value of discriminating property
     */
    constructor(public name:string,public value:string){}
}
export interface ITypeDefinition extends INamedEntity {


    key():NamedId
    /**
     * list os super types
     */
    superTypes(): ITypeDefinition[];

    /**
     * list of sub types
     */
    subTypes(): ITypeDefinition[];

    /**
     * list of all subtypes not including this type
     */
    allSubTypes(): ITypeDefinition[];


    /**
     * List of all super types not including this type
     */
    allSuperTypes(): ITypeDefinition[];

    /**
     * Propertis decared in this type
     */
    properties(): IProperty[];

    facet(n:string): IProperty

    /**

     * List off all properties (declared in this type and super types),
     * did not includes properties fixed to fixed facet use facet for them
     */
    allProperties(visited?:any): IProperty[];

    /**
     * Facets declared by the type and its supertypes
     */
    allFacets(visited?:any):IProperty[];

    /**
     * Facets declared by the type
     */
    facets():IProperty[];

    /**
     * Whether this type is value type. Does not perform a search in super types.
     */
    isValueType():boolean;

    /**
     * true if this type is value type or one of its super types is value type.
     */
    hasValueTypeInHierarchy(): boolean;

    /**
     * Whether this type is an array. Does not perform a search in super types.
     */
    isArray():boolean;

    /**
     * Whether this type is object. Performs a search in super types.
     */
    isObject():boolean;

    /**
     * true if this type is array or one of its super types is array.
     */
    hasArrayInHierarchy():boolean;

    /**
     * Casts this type to an array. Does not perform a search in super types.
     */
    array():IArrayType;

    /**
     * casting to nearest array type in hierarchy
     */
    arrayInHierarchy():IArrayType;

    /**
     * Whether this type is a union. Does not perform a search in super types.
     */
    isUnion():boolean;

    /**
     * true if this type is union or one of its super types is union.
     */
    hasUnionInHierarchy(): boolean;

    /**
     * Casts this type to a union type. Does not perform a search in super types.
     */
    union():IUnionType;

    /**
     * Casting to nearest union type in hierarchy
     */
    unionInHierarchy():IUnionType;


    isAnnotationType():boolean

    annotationType():IAnnotationType


    /**
     * true if this type values have internal structure
     */
    hasStructure(): boolean;

    /**
     * true if this type is external. Does not perform a search in super types.
     */
    isExternal():boolean;

    /**
     * true if this type is external type, or one if its super types is an external type.
     */
    hasExternalInHierarchy():boolean;

    /**
     * Casts this type to an external type. Does not perform a search in super types.
     */
    external():IExternalType;

    /**
     * Casting to nearest external type in hierarchy
     */
    externalInHierarchy(): IExternalType


    /**
     * List of value requirements for this type,
     * used to discriminate a type from a list of subtype
     */
    valueRequirements(): ValueRequirement [];

    /**
     * parent universe
     */
    universe():IUniverse;

    /**
     * return true if this type is assignable to a given type
     * @param typeName
     */
    isAssignableFrom(typeName : string) : boolean;

    /**
     * return property by it name looks in super classes
     * but will not return anything if property is a fixed with facet
     * @param name
     */
    property(name:string):IProperty

    /**
     * helper method to get required properties only
     */
    requiredProperties():IProperty[];

    /**
     * @return map of fixed facet names to fixed facet values;
     */
    getFixedFacets():{ [name:string]:any};

    /**
     * @return map of fixed facet names to fixed facet values;
     */
    allFixedFacets():{ [name:string]:any};

    /**
     * Print details of this type.
     * Used mostly for debug and demosntration purposes.
     * @param indent
     */
    printDetails(indent? : string, settings?: IPrintDetailsSettings) : string;

    /**
     * Returns examples for this type.
     * Returned examples should be tested for being empty and being expandable.
     */
    examples() : IExpandableExample[];

    /**
     * Returns whether this type contain genuine user defined type in its hierarchy.
     * Genuine user defined type is a type user intentionally defined and filled with
     * properties or facets, or having user-defined name as opposed to a synthetic user-defined type.
     */
    isGenuineUserDefinedType() : boolean;

    /**
     * Returns nearest genuine user-define type in the hierarchy.
     * Genuine user defined type is a type user intentionally defined and filled with
     * properties or facets, or having user-defined name as opposed to a synthetic user-defined type.
     */
    genuineUserDefinedType() : ITypeDefinition;

    kind():string[];

}
export interface FacetValidator{
    (value:any, facetValue:any):string;
}
export interface IValueDocProvider{
    (v:string):string
}

/**
 * represent array types
 */
export interface IArrayType extends ITypeDefinition{
    componentType():ITypeDefinition
}

export interface IExternalType extends ITypeDefinition{
    schema(): string
}
/**
 * represent union types
 */
export interface IUnionType extends ITypeDefinition{
    leftType():ITypeDefinition
    rightType():ITypeDefinition
}
/**
 * collection of types
 */
export interface IUniverse {
    /**
     * type for a given name
     * @param name
     */
    type(name:string): ITypeDefinition;

    /**
     * version of this universe
     */
    version(): string;

    /**
     * All types in universe
     */
    types():ITypeDefinition[]

    /**
     * highlevel information about universe
     */
    matched():{[name:string]:NamedId}


}

export interface IProperty extends INamedEntity{

    /**
     * name of the property
     */
    nameId():string
    /**
     * returns true if this property matches the a given property name
     * (it is important for additional and pattern properties)
     * @param k
     */
    matchKey(k:string):boolean

    /**
     * range of the property (basically it is type)
     */
    range():ITypeDefinition
    /**
     * domain of the property (basically declaring type)
     */
    domain():ITypeDefinition

    /**
     * true if this property is required to fill
     */
    isRequired():boolean;
    /**
     * true if this property can have multiple values
     */
    isMultiValue():boolean
    /**
     * true if this property range is one of built in value types
     */
    isPrimitive():boolean;
    /**
     * true if this property range is a value type
     */
    isValueProperty() : boolean;

    /**
     * return a prefix for a property name - used for additional properties
     */
    keyPrefix():string
    /**
     * return a pattern for a property name - used for a pattern properties
     */
    getKeyRegexp():string;
    /**
     * returns a default value for this property
     */
    defaultValue():any
    /**
     * if this property range is constrained to a fixed set of values it will return the values
     */
    enumOptions():string[]
    /**
     * true if this property is a discriminator
     */
    isDescriminator():boolean;
}
export interface IAnnotationType extends  ITypeDefinition{
    parameters(): ITypeDefinition[]
    allowedTargets():any
}