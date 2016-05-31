import ti = require("./nominal-interfaces")
export type IAnnotation=ti.IAnnotation;
export type ITypeDefinition=ti.ITypeDefinition;
export type IExpandableExample=ti.IExpandableExample;
export type IUniverse=ti.IUniverse;
export type IUnionType=ti.IUnionType;
export type IProperty=ti.IProperty;
export type IArrayType=ti.IArrayType;
export type NamedId=ti.NamedId;
export type IExternalType=ti.IExternalType;
export type FacetValidator=ti.FacetValidator;
export type IPrintDetailsSettings=ti.IPrintDetailsSettings;
export type IAnnotationType=ti.IAnnotationType;
export type INamedEntity=ti.INamedEntity;
import _=require("./utils")
declare var global:any;
global["extraInjectors"]=[];

declare function require(s:string):any;
export interface Injector{
    inject(a:Adaptable):void;
}
//var extraInjections:Injector[]=[];

export function registerInjector(i:Injector){
  //  extraInjections.push(i);
    global["extraInjectors"].push(i);
}

export class Adaptable{
    private  adapters: any[]=[]

    addAdapter(q: any){
        this.adapters.push(q);
    }

    constructor(){
        (<Injector[]>global["extraInjectors"]).forEach(x=>x.inject(this))

    }

    getAdapter<T>(adapterType:{ new(p?:any): T ;}):T{
        var result:T=null;
        this.adapters.forEach(x=>{
            if (x instanceof adapterType){
                result=<T>x;
            }
        })
        return result;
    }
}
export class Described extends Adaptable{
    constructor(private _name:string,private _description=""){super()}

    nameId():string{return this._name;}
    description():string{return this._description}

    private _tags:string[]=[]

    private _version:string;

    private _annotations: IAnnotation[]=[]

    addAnnotation(a:IAnnotation){
        this._annotations.push(a);
    }
    removeAnnotation(a: IAnnotation){
        this._annotations=this._annotations.filter(x=>x!=a);
    }

    annotations(){
        return [].concat(this._annotations);
    }

    tags(){
        return this._tags;
    }

    withDescription(d:string){
        this._description=d;
        return this;
    }

    setName(name:string){
        this._name = name;
    }
}

export class Annotation extends Described implements IAnnotation{

    constructor(private type:IAnnotationType,private parameters: { [name:string]:any}){
        super(type.nameId());
    }

    parameterNames(){
        return Object.keys(this.parameters);
    }
    parameter(name:string):any{
        return this.parameters[name];
    }
    getType(){
        return this.type;
    }
}
export class Empty{

}

class EmptyUniverse implements  IUniverse{

    type(name:string):ITypeDefinition {
        return null;
    }

    version():string {
        return "Empty";
    }

    types():ITypeDefinition[] {
        return [];
    }

    matched():{ [name:string]:NamedId} {
        return {};
    }
}
var emptyUniverse:IUniverse =new EmptyUniverse();

var ebuilder=require("./exampleBuilder")
export class AbstractType extends Described implements ITypeDefinition{


    _key: NamedId;




    _isCustom:boolean

    _customProperties:IProperty[]=[];

    properties():IProperty[]{
        return [];
    }
    externalInHierarchy(){
        var x=this.allSuperTypes();
        var res:ExternalType=null;
        x.forEach(y=>{
            if (y instanceof ExternalType){
                res= (<ExternalType>y);
            }
        });
        return res;
    }
    private _props:IProperty[];
    protected _allFacets:IProperty[]
    protected _facets: IProperty[]=[];

    addFacet(q:IProperty){
        this._facets.push(q);
    }

    allFacets(ps:{[name:string]:ITypeDefinition}={}):IProperty[]{
        if (this._allFacets){
            return this._allFacets;
        }
        if (ps[this.nameId()]){
            return [];
        }
        ps[this.typeId()]=this;
        var n:{[name:string]:IProperty}={}
        if (this.superTypes().length>0){
            this.superTypes().forEach(x=>{
                if (x instanceof AbstractType) {
                    (<AbstractType>x).allFacets(ps).forEach(y=>n[y.nameId()] = <any>y);
                }
            })
        }
        this._facets.forEach(x=>n[x.nameId()]=x);
        //this.properties().forEach(x=>n[x.nameId()]=x);
        this._allFacets=Object.keys(n).map(x=>n[x]);
        return this._allFacets;
    }

    facets():IProperty[]{
        return [].concat(this._facets);
    }

    facet(name: string){
        return _.find(this.allFacets(),x=>x.nameId()==name);
    }

    typeId():string{
        return this.nameId();
    }

    allProperties(ps:{[name:string]:ITypeDefinition}={}):IProperty[]{
        if (this._props){
            return this._props;
        }
        if (ps[this.typeId()]){
            return [];
        }
        ps[this.typeId()]=this;
        var n:{[name:string]:IProperty}={}
        if (this.superTypes().length>0){
            this.superTypes().forEach(x=>{
                if (x instanceof AbstractType) {
                    x.allProperties(ps).forEach(y=>n[y.nameId()] = <any>y);
                }
                else{
                    x.allProperties().forEach(y=>n[y.nameId()] = <any>y);
                }
            })
        }
        for (var x in this.getFixedFacets()){
            delete n[x];
        }
        this.properties().forEach(x=>n[x.nameId()]=x);
        this._props=Object.keys(n).map(x=>n[x]);
        return this._props;
    }

    property(propName:string):IProperty {
        return _.find(this.allProperties(), x=>x.nameId() == propName);
    }
    hasValueTypeInHierarchy(){
        return _.find(this.allSuperTypes(),x=>{
                var mm=<any>x;
                if (mm.uc){
                    return false;
                }
                mm.uc=true;
                try{
                    return x.hasValueTypeInHierarchy()
                }finally{
                    mm.uc=false
                }

            })!=null;
    }
    isAnnotationType(){
        return false;
    }
    hasStructure(){
        return false;
    }



    key (): NamedId{
        if (this._key){
            return this._key;
        }
        if (this._universe) {
            this._key = this.universe().matched()[this.nameId()];
            if (!this._key) {
                return null;
            }
        }
        return this._key;
    }


    _superTypes:ITypeDefinition[]=[];
    _subTypes:ITypeDefinition[]=[];
    _requirements:ti.ValueRequirement[]=[];


    isUserDefined(): boolean{
        return false;
    }

    private fixedFacets:{ [name:string]:any}={}


    hasArrayInHierarchy(){
        var arr =_.find(this.allSuperTypes(),x=>x instanceof Array)!=null;
        return arr;
    }
    arrayInHierarchy():IArrayType{
        var x=this.allSuperTypes();
        var res:IArrayType=null;
        x.forEach(y=>{
            if (y instanceof Array){
                res= (<Array>y);
            }
        });
        return res;
    }
    uc:boolean=false;

    unionInHierarchy():IUnionType{
        var x=this.allSuperTypes();
        var res:IUnionType=null;
        x.forEach(y=>{
            if (y instanceof Union){
                res= (<Union>y);
            }
        });
        return res;
    }
    hasExternalInHierarchy(){
        return _.find(this.allSuperTypes(),x=>{
                var mm=<any>x;
                if (mm.uc){
                    return false;
                }
                mm.uc=true;
                try{
                    return x instanceof ExternalType
                }finally{
                    mm.uc=false
                }

            })!=null;

    }

    hasUnionInHierarchy(){
        return _.find(this.allSuperTypes(),x=>{
                var mm=<any>x;
                if (mm.uc){
                    return false;
                }
                mm.uc=true;
                try{
                    return x.hasUnionInHierarchy()
                }finally{
                    mm.uc=false
                }

            })!=null;

    }

    fixFacet(name:string,v: any){
        this.fixedFacets[name]=v;
    }

    protected _af:{ [name:string]:any};

    getFixedFacets():{ [name:string]:any}{
        var mm:{ [name:string]:any}={};
        for (var q in  this.fixedFacets){
            mm[q]=this.fixedFacets[q];
        }
        this.contributeFacets(mm);
        return mm;
    }

    allFixedFacets():{ [name:string]:any}{
        if (this._af){
            return this._af;
        }
        var sp=this.allSuperTypes();
        sp.push(this);
        var mm:{ [name:string]:any}={};
        sp.forEach(x=>{
            var ff = x.getFixedFacets();
            for( var key in Object.keys(ff)){
                mm[key] = ff[key];
            }
        });
        this._af=mm;
        return mm;
    }

    protected contributeFacets(x:{ [name:string]:any}){

    }

    private _nameAtRuntime:string

    getPath(){
        return this._path;
    }

    setNameAtRuntime(name:string){
        this._nameAtRuntime=name;
    }
    getNameAtRuntime(){
        return this._nameAtRuntime;
    }

    constructor(_name:string,public _universe:IUniverse=emptyUniverse ,private _path:string=""){
        super(_name)
    }

    universe():IUniverse{
        if (!this._universe){
            return new EmptyUniverse();
        }
        return this._universe;
    }

    superTypes():ITypeDefinition[]{
        return [].concat(this._superTypes);
    }

    isAssignableFrom(typeName : string) : boolean {
        if (this.nameId() == typeName) {
            if (this.isUserDefined()){
                return false;
            }
            return true;
        }

        var currentSuperTypes = this.allSuperTypes();
        for (var i =0;i<currentSuperTypes.length;i++) {
            if (currentSuperTypes[i].nameId()==typeName) {
                return true;
            }
        }

        return false;
    }
    annotationType():IAnnotationType{
        return null;
    }

    subTypes():ITypeDefinition[]{
        return [].concat(this._subTypes);
    }

    allSubTypes():ITypeDefinition[]{
        var rs:ITypeDefinition[]=[];
        this.subTypes().forEach(x=>{
            rs.push(x);
            rs=rs.concat(x.allSubTypes());
        })
        return _.unique(rs);
    }
    allSuperTypes():ITypeDefinition[]{
        var rs:ITypeDefinition[]=[];
        this.allSuperTypesRecurrent(<any>this,{},rs);
        return _.unique(rs);
    }
    private allSuperTypesRecurrent(t:ITypeDefinition,m:{[name:string]:ITypeDefinition},result:ITypeDefinition[]){
        t.superTypes().forEach(x=>{
            if (!m[(<AbstractType>x).typeId()]) {
                result.push(x);
                m[(<AbstractType>x).typeId()] = x;
                this.allSuperTypesRecurrent(x, m, result);
            }
        })
    }

    addSuperType(q:AbstractType){
        q._subTypes.push(this);
        this._superTypes.push(q);
    }

    addRequirement(name:string,value:string){
        this._requirements.push(new ti.ValueRequirement(name,value))
    }

    //FIXME simplify it
    valueRequirements(){
        return this._requirements;
    }



    requiredProperties():IProperty[]{
        return this.allProperties().filter(x=>x.isRequired());
    }

    printDetails(indent? : string, settings?: IPrintDetailsSettings) : string {
        if (!indent) {
            indent = "";
        }

        if (!settings) {
            settings = {
                hideProperties : false,
                hideSuperTypeProperties : false,
                printStandardSuperclasses : false
            }
        }

        var standardIndent = "  ";

        var result = "";

        var className = this.getTypeClassName();
        result += indent + this.nameId() + "[" + className + "]" + "\n";

        var properties = this.properties();
        if (properties && properties.length > 0 && !settings.hideProperties) {
            result += indent + standardIndent + "Properties:\n";
            properties.forEach(property => {
                var propertyType = "";

                var propertyRange = property.range();
                if (propertyRange instanceof Described) {
                    propertyType += (<any>propertyRange).nameId();
                }

                if (propertyRange instanceof AbstractType) {
                    propertyType += "[";
                    propertyType += (<AbstractType>propertyRange).getTypeClassName();
                    propertyType += "]";
                }

                result += indent + standardIndent + standardIndent + property.nameId() + " : " + propertyType + "\n"
            })
        }

        var superTypes = this.superTypes();
        var filteredSuperTypes = superTypes;

        if (superTypes && !settings.printStandardSuperclasses) {
            filteredSuperTypes = _.filter(superTypes, superType=>{

                var name = superType instanceof Described ? (<any>superType).nameId() : "";
                var type = superType instanceof AbstractType ?
                    (<AbstractType>superType).getTypeClassName() : "";
                return !this.isStandardSuperclass(name, type);

            })
        }

        if (filteredSuperTypes && filteredSuperTypes.length > 0) {
            result += indent + standardIndent + "Super types:\n";
            filteredSuperTypes.forEach(superType=>{
                result += superType.printDetails(indent + standardIndent + standardIndent,
                    {
                        hideProperties : settings.hideSuperTypeProperties,
                        hideSuperTypeProperties : settings.hideSuperTypeProperties,
                        printStandardSuperclasses : settings.printStandardSuperclasses
                    });
            })
        }

        return result;
    }

    private getTypeClassName() : string {
        return this.constructor.toString().match(/\w+/g)[1];
    }

    private isStandardSuperclass(nameId : string, className : string) {

        if (nameId === "TypeDeclaration" && className === "NodeClass") return true;
        if (nameId === "ObjectTypeDeclaration" && className === "NodeClass") return true;
        if (nameId === "RAMLLanguageElement" && className === "NodeClass") return true;

        return false;
    }

    /**
     * Returns example for this type.
     * Returned example should be tested for being empty and being expandable.
     */
    examples() : IExpandableExample[] {
        return ebuilder.exampleFromNominal(this);
    }

    /**
     * Returns whether this type contain genuine user defined type in its hierarchy.
     * Genuine user defined type is a type user intentionally defined and filled with
     * properties or facets, or having user-defined name as opposed to a synthetic user-defined type.
     */
    isGenuineUserDefinedType() : boolean {
        return this.nameId()&&this.nameId().length>0;
    }

    /**
     * Returns nearest genuine user-define type in the hierarchy.
     * Genuine user defined type is a type user intentionally defined and filled with
     * properties or facets, or having user-defined name as opposed to a synthetic user-defined type.
     */
    genuineUserDefinedType() : ITypeDefinition {
        if (this.getAdapter(Empty)){
            if (this.superTypes().length==1){
                return this.superTypes()[0];
            }
        }
        return this;
    }

    customProperties():IProperty[]{
        return [].concat(this._customProperties)
    }

    allCustomProperties():IProperty[]{
        var props:IProperty[] = [];
        this.superTypes().forEach(x=>props = props.concat((<AbstractType>x).allCustomProperties()));
        props = props.concat(this.customProperties());
        return props;
    }

    registerCustomProperty(p:IProperty){
        if (p.domain()!=this){
            throw new Error("Should be already owned by this");
        }
        if (this._customProperties.indexOf(p)!=-1){
            throw new Error("Already included");
        }
        this._customProperties.push(p);
    }

    setCustom(val:boolean){
        this._isCustom = val;
    }

    isCustom():boolean{
        return this._isCustom;
    }

    isUnion() {
        return false;
    }

    union():IUnionType {
        return null;
    }

    isExternal() {
        return false;
    }

    external():IExternalType{
        return null;
    }

    isArray() {
        return false;
    }

    isObject() {
        if(this.nameId()=="object"){
            return true;
        }
        for(var t of this.allSuperTypes()){
            if(t.isObject()){
                return true;
            }
        }
        return false;
    }

    array():IArrayType {
        return null;
    }

    isValueType() {
        return false;
    }

    kind():string[]{

        var result:string[] = [];
        if(this.isObject()){
            result.push("object");
        }
        if(this.isArray()){
            result.push("array");
        }
        if(this.isValueType()){
            result.push("value");
        }
        if(this.isUnion()){
            result.push("union");
        }
        if(this.isAnnotationType()){
            result.push("annotation");
        }
        if(this.isExternal()){
            result.push("external");
        }
        return result;
    }
}
export class ValueType extends AbstractType implements ITypeDefinition{
    constructor(name:string,_universe:IUniverse=null,path:string="",description=""){
        super(name,_universe,path);
    }
    hasStructure():boolean{
        return false;
    }

    hasValueTypeInHierarchy(){
        return true;
    }

    isValueType() {
        return true;
    }

    isUnionType(){
        return false;
    }

    isObject() {
        return false;
    }
}

export class StructuredType extends AbstractType implements ITypeDefinition{
    _properties:IProperty[]=[];

    hasStructure():boolean{
        return true;
    }


    propertyIndex(name:string):number {
        var props = this.properties();
        for(var i=0; i<props.length; i++) {
            if(props[i].nameId() == name) return i;
        }
        return -1;
    }

    addProperty(name:string,range:ITypeDefinition):Property{
        return new Property(name).withDomain(this).withRange(range);
    }

    allPropertyIndex(name:string):number {
        var props = this.allProperties();
        for(var i=0; i<props.length; i++) {
            if(props[i].nameId() == name) return i;
        }
        return -1;
    }

    properties():IProperty[]{
        return [].concat(this._properties)
    }

    registerProperty(p:IProperty){
        if (p.domain()!=this){
            throw new Error("Should be already owned by this");
        }
        if (this._properties.indexOf(p)!=-1){
            throw new Error("Already included");
        }
        this._properties.push(p);
    }
}
export class Property extends Described implements IProperty{

    private _ownerClass:StructuredType
    private _nodeRange:ITypeDefinition;
    protected _groupName:string;
    protected _keyShouldStartFrom:string=null;
    protected _enumOptions:string[];
    private _isRequired:boolean=false;
    private _isMultiValue:boolean=false;
    private _defaultValue:any
    private _descriminates:boolean=false;
    private _defaultBooleanValue:boolean = null;
    private _defaultIntegerValue:number = null;

    withMultiValue(v:boolean=true){
        this._isMultiValue=v;
        return this;
    }
    withDescriminating(b:boolean){
        this._descriminates=b;
        return this;
    }

    withRequired(req:boolean){
        this._isRequired=req;
        return this;
    }
    isRequired(){
        return this._isRequired;
    }
    withKeyRestriction(keyShouldStartFrom:string){
        this._keyShouldStartFrom=keyShouldStartFrom;
        return this;
    }

    withDomain(d:StructuredType,custom:boolean=false):Property{
        this._ownerClass=d;
        if(custom) {
            d.registerCustomProperty(this);
        }
        else{
            d.registerProperty(this);
        }
        return this;
    }
    setDefaultVal(s:any){
        this._defaultValue=s;
        return this;
    }
    setDefaultBooleanVal(s:any){
        this._defaultBooleanValue=s;
        return this;
    }
    setDefaultIntegerVal(s:any){
        this._defaultIntegerValue=s;
        return this;
    }

    defaultValue(){
        if(this._defaultValue != null) {
            return this._defaultValue;
        }
        else if(this._defaultBooleanValue != null) {
            return this._defaultBooleanValue;
        }
        else if(this._defaultIntegerValue != null) {
            return this._defaultIntegerValue;
        }

        return null;
    }
    isPrimitive(){
        return false;
    }
    withRange(t:ITypeDefinition){
        this._nodeRange=t;
        return this;
    }
    isValueProperty(){
        return this._nodeRange.hasValueTypeInHierarchy();
    }

    enumOptions(){
        if (this._enumOptions && typeof this._enumOptions == 'string') {
            return [this._enumOptions + ""];
        }
        return this._enumOptions
    }
    keyPrefix(){
        return this._keyShouldStartFrom
    }
    withEnumOptions(op:string[]){
        this._enumOptions=op;
        return this;
    }
    _keyRegexp:string;
    withKeyRegexp(regexp:string){
        this._keyRegexp=regexp;
        return this;
    }
    getKeyRegexp(){
        return this._keyRegexp
    }

    matchKey(k:string):boolean{
        if (k==null){
            return false;
        }
        if (this._groupName!=null){
            return this._groupName==k;
        }
        else{
            if (this._keyShouldStartFrom!=null){
                if(k.indexOf(this._keyShouldStartFrom)==0){
                    return true;
                }
            }
            if(this._enumOptions){
                if (this._enumOptions.indexOf(k)!=-1){
                    return true;
                }
            }
            if (this.getKeyRegexp()) {
                try {
                    if(new RegExp(this.getKeyRegexp()).test(k)){
                        return true;
                    }
                } catch (Error){
                    //ignoring as the most probable reason for an error is an invalid pattern, we dont want to spam log
                    //with that kind of exceptions
                }
            }
            return false;
        }
    }
    private facetValidator: FacetValidator;

    getFacetValidator(){
        return this.facetValidator;
    }

    setFacetValidator(f: FacetValidator){
        this.facetValidator=f;
    }

    domain():StructuredType{
        return this._ownerClass;
    }
    range():ITypeDefinition{
        return this._nodeRange;
    }

    isMultiValue(){
        if (this.range()&& this.range().hasArrayInHierarchy()){
            return true;
        }
        return this._isMultiValue;
    }
    isDescriminator(){
        return this._descriminates;
    }

}
export class Union extends AbstractType implements IUnionType{

    left:ITypeDefinition;
    right:ITypeDefinition;

    key():NamedId{
        return null;
    }

    leftType():ITypeDefinition{
        return this.left;
    }

    rightType():ITypeDefinition{
        return this.right;
    }

    isUserDefined(): boolean{
        return true;
    }

    unionInHierarchy(){
        return this;
    }

    union() {
        return this;
    }

    hasUnionInHierarchy(){
        return true;
    }

    isUnion() {
        return true;
    }

    isObject() {
        return this.leftType().isObject() && this.rightType().isObject();
    }

    hasArrayInHierarchy(){
        if (this.left&&this.right){
            return this.left.hasArrayInHierarchy()||this.right.hasArrayInHierarchy();
        }
        if (this.left){
            return this.left.hasArrayInHierarchy()
        }
        if (this.right){
            return this.right.hasArrayInHierarchy()
        }
    }
}
export class Array extends AbstractType implements IArrayType{
    dimensions: number
    component:ITypeDefinition;

    hasArrayInHierarchy(){
        return true;
    }

    isArray() {
        return true;
    }

    isObject() {
        return false;
    }

    arrayInHierarchy(){
        return this;
    }

    array() {
        return this;
    }

    isUserDefined(): boolean{
        return true;
    }

    componentType(){
        return this.component;
    }

    setComponent(t:ITypeDefinition){
        this.component=t;
    }

    key():NamedId{
        return null;
    }

}

export class ExternalType extends StructuredType implements IExternalType{

    schemaString:string;

    externalInHierarchy(){
        return this;
    }
    typeId(){
        return this.schemaString;
    }
    schema(){
        return this.schemaString;
    }

    isUserDefined(): boolean{
        return true;
    }

    hasExternalInHierarchy(){
        return true;
    }

    isExternal() {
        return true;
    }

    external() {
        return this;
    }
}

