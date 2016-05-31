
export import  rt=require("raml-typesystem")
import typeSystem=rt.nominalTypes;
function registerAdapters(a:typeSystem.Adaptable){
    if ((<any>a)["isUnion"]) {
        a.addAdapter(new RAMLService(<AbstractType>a))
    }
    else if ((<any>a)["range"]) {
        a.addAdapter(new RAMLPropertyService(<Property>a))
    }
}
export type IHighLevelNode=any
export type IParseResult=any
export type Named=typeSystem.NamedId;
export var injector={
    inject(a:typeSystem.Adaptable){
        registerAdapters(a);
    }
}
typeSystem.registerInjector(injector);
/**
 * What is our universe at first we have node types
 * they have following fundamental properties:
 * some nodes can fold to another kinds of nodes
 *
 */
export type IType = typeSystem.ITypeDefinition
export type ITypeDefinition = typeSystem.ITypeDefinition
export type IProperty=typeSystem.IProperty

export class AbstractType extends typeSystem.AbstractType implements typeSystem.ITypeDefinition{}


export class ValueType extends typeSystem.ValueType implements IType{}
export class EnumType extends ValueType{
    values:string[]=[];
}
export interface IValueDocProvider{
    (v:string):string
}
export interface IValueSuggester{
    (node:IHighLevelNode):string[]
}

export class ReferenceType extends ValueType{

   constructor(name:string,path:string,private referenceTo:string,_universe:Universe){
     super(name,_universe,path)
   }


   getReferencedType():NodeClass{
       return <NodeClass>this.universe().type(this.referenceTo);
   }

    hasStructure():boolean{
        return true;
    }
}

export class NodeClass extends typeSystem.StructuredType implements IType,typeSystem.ITypeDefinition{

    constructor(_name:string,universe:Universe,path:string,_description="") {
        super(_name,universe,path)
    }

    allProperties(v:{ [name:string]: typeSystem.ITypeDefinition}={}):Property[]{
        return <Property[]>super.allProperties(v);
    }
}

export class UserDefinedClass extends NodeClass{
    key(){
        return null;
    }

    isUserDefined(): boolean{
        return true;
    }

    typeId():string{
        var rs= this.nameId();
        var node=this.getAdapter(RAMLService).getDeclaringNode();
        if (node){
            rs=rs+node.lowLevel().start();
            var unit = node.lowLevel().unit();
            if (unit) {
                rs = rs + unit.absolutePath();
            }
        }
        return rs;
    }
    constructor(name:string, universe:Universe, hl:IHighLevelNode,path:string, description:string) {
        super(name, universe, path, description);
        this.getAdapter(RAMLService).setDeclaringNode(hl);
    }

    _value:boolean;

    hasValueTypeInHierarchy(){
        if (this._value){
            return true;
        }
        if (this.isAssignableFrom("ObjectTypeDeclaration")){
            return false;
        }

        return false;
    }

    /**
     * Returns whether this type contain genuine user defined type in its hierarchy.
     * Genuine user defined type is a type user intentionally defined and filled with
     * properties or facets, or having user-defined name as opposed to a synthetic user-defined type.
     */
    isGenuineUserDefinedType() : boolean {
        return this.genuineUserDefinedType() != null;
    }

    /**
     * Returns nearest genuine user-define type in the hierarchy.
     * Genuine user defined type is a type user intentionally defined and filled with
     * properties or facets, or having user-defined name as opposed to a synthetic user-defined type.
     */
    genuineUserDefinedType() : typeSystem.ITypeDefinition {
        var declaringNode=this.getAdapter(RAMLService).getDeclaringNode();
        if (!declaringNode) {
            return null;
        }

        return this;
    }
}
export class AnnotationType extends UserDefinedClass{
    allProperties(ps:{[name:string]:typeSystem.ITypeDefinition}={}):Property[]{
        var rs=this.superTypes()[0].allProperties();
        if (rs.length==0){
            var up=new UserDefinedProp("value");
            up.withDomain(this);
            up._node=this.getAdapter(RAMLService).getDeclaringNode();
            up.withCanBeValue();
            up.withRequired(false);
            var tp=this.superTypes()[0];
            rs=[];
            up.withRange(up._node.asElement().definition().universe().type("string"));
            rs.push(up);

        }
        return <any>rs;
    }

    isAnnotationType(){
        return true;
    }
}

export interface IUniverseDescriptor{

    [name:string]:typeSystem.NamedId;
}

export class Universe extends typeSystem.Described implements typeSystem.IUniverse{

    private _classes:IType[]=[]
    private _uversion:string="RAML08"


    private _topLevel:string;

    private matchedObjects;

    private _typedVersion:string;

    matched():IUniverseDescriptor{
        if (this.matchedObjects){
            return this.matchedObjects;
        }
        if (this._parent){
            return this._parent.matched();
        }

    }

    setTopLevel(t:string){
        this._topLevel=t;
    }
    getTopLevel(){
        return this._topLevel;
    }

    setTypedVersion(tv:string){
        this._typedVersion=tv;
    }
    getTypedVersion(){
        return this._typedVersion;
    }

    version(){
        return this._uversion;
    }

    setUniverseVersion(version:string){
        this._uversion=version;
    }
    types():IType[]{
        var result=[].concat(this._classes);
        if (this._parent!=null){
            result=result.concat(this._parent.types());
        }
        return result;
    }

    type(name:string):ITypeDefinition{
        if(this.aMap[name]){
            return this.aMap[name];
        }
        var tp:ITypeDefinition;
        for (var i=0;i<this._classes.length;i++){
            if (this._classes[i].nameId()==name){
                tp=this._classes[i];
                break;
            }
        }
        if(tp==null){
            if (this._parent){
                var tp= this._parent.type(name);
                if (tp instanceof AbstractType){
                    var at=<AbstractType><any>tp;
                    at._universe=this;//FIXME
                }
            }
        }
        return tp;
    }


    register(t:IType){
        this._classes.push(t);
        if (t instanceof NodeClass) {
            this._classes.forEach(x=> {
                if (x instanceof NodeClass) {
                    var nc =<NodeClass> x;
                    if (nc.getAdapter(RAMLService).getExtendedType() == t) {
                        t.getAdapter(RAMLService).getRuntimeExtenders().push(x)
                    }
                }}
                )
        }
        return this;
    }
    private aMap:{ [name:string]:IType}={}
    registerAlias(a:string,t:IType){
        this.aMap[a]=t;
    }
    unregister(t:IType){
        this._classes=this._classes.filter(x=>x!=t);
        var st=t.superTypes();
        st.forEach(x=>{
            var a:AbstractType=(<any>x);
            a._superTypes=a._superTypes.filter(x=>x!=t);
        })
        st=t.subTypes();
        st.forEach(x=>{
            var a:AbstractType=(<any>x);
            a._subTypes=a._subTypes.filter(x=>x!=t);
        })
        return this;
    }

    constructor(dec:IUniverseDescriptor,name:string="",private _parent:Universe=null,v:string="RAML08"){
        super(name)

        this.matchedObjects=dec;
        this._uversion=v;
    }

    registerSuperClass(t0:IType,t1:IType){
        var a0:AbstractType=(<any>t0);
        var a1:AbstractType=(<any>t1);
        a0._superTypes.push(t1);
        a1._subTypes.push(t0);
    }

}

export function prop(name:string,desc:string,domain:NodeClass,range:IType,custom?:boolean):Property{
    var prop=new Property(name,desc);
    return <Property>prop.withDomain(domain,custom).withRange(range)
}
export class ChildValueConstraint{
    constructor(public name:string,public value:string){}
}


export class Property extends typeSystem.Property implements typeSystem.IProperty{

    private _isFromParentValue:boolean=false;
    private _isFromParentKey:boolean=false;

    private _key:boolean=false;
    private _declaresFields:boolean;
    private _describes:string=null;
    private _inheritsValueFromContext:string;
    private _canBeDuplicator:boolean
    private _allowsNull:boolean
    private _canBeValue:boolean;
    private _isInherited:boolean
    private _oftenKeys:string[]
    private _vprovider:IValueDocProvider
    private _suggester:IValueSuggester
    private _selfNode=false;
    private _noDirectParse:boolean=false;

    isPrimitive(){
        return this.range().isValueType()&&!(this.range() instanceof  ReferenceType);
    }

    withNoDirectParse(){
        this._noDirectParse=true;
    }
    isNoDirectParse(){
        return this._noDirectParse;
    }

    withSelfNode(){
        this._selfNode=true;
    }
    isSelfNode(){
        return this._selfNode;
    }

    matchKey(k:string):boolean{
        if (this._groupName!=null){
            if (this.isAnnotation()){
                if (k.charAt(0)=='('&&k.charAt(k.length-1)==')'){
                    return true;
                }
                return false;
            }
            return this._groupName==k;
        }
        else{
            return super.matchKey(k);
        }
    }

    valueDocProvider():IValueDocProvider{
        return this._vprovider;
    }
    setValueDocProvider(v:IValueDocProvider){
        this._vprovider=v;
        return this;
    }
    suggester():IValueSuggester{
        return this._suggester;
    }
    setValueSuggester(s:IValueSuggester){
        this._suggester=s;
    }
    enumOptions():string[]{
        if (this._enumOptions && typeof this._enumOptions == 'string') {
            return [this._enumOptions + ""];
        }

        return this._enumOptions;
    }

    getOftenKeys(){
        return this._oftenKeys;
    }

    withOftenKeys(keys:string[]){
        this._oftenKeys=keys;
        return this;
    }
    withCanBeValue(){
        this._canBeValue=true;
        return this;
    }
    withInherited(w:boolean){
        this._isInherited=w;
    }
    isInherited(){
        return this._isInherited;
    }

    isAllowNull(){
        return this._allowsNull;
    }
    withAllowNull(){
        this._allowsNull=true;
    }

    getCanBeDuplicator(){
        return this._canBeDuplicator
    }


    canBeValue():boolean{
        return this._canBeValue;
    }

    setCanBeDuplicator(){
        this._canBeDuplicator=true;
        return true;
    }

    inheritedContextValue(){
        return this._inheritsValueFromContext;
    }

    withInheritedContextValue(v:string){
        this._inheritsValueFromContext=v;
        return this;
    }

    private _contextReq:{name:string;value:string}[]=[]

    withContextRequirement(name:string,value:string){
        this._contextReq.push({name:name,value:value});
    }
    getContextRequirements(){
        return this._contextReq;
    }

    withDescribes(a:string){
        this._describes=a;
        return this;
    }

    describesAnnotation(){
        return this._describes!=null;
    }
    describedAnnotation(){
        return this._describes
    }

    private _newInstanceName:string;

    isReference(){
        return this.range() instanceof ReferenceType
    }

    referencesTo():IType{
        return <IType>(<ReferenceType>this.range()).getReferencedType();
    }

    newInstanceName():string{
        if (this._newInstanceName){
            return this._newInstanceName;
        }
        return this.range().nameId()
    }
    withThisPropertyDeclaresFields(b:boolean=true){
        this._declaresFields=b;
        return this;
    }
    isThisPropertyDeclaresTypeFields(){
        return this._declaresFields;
    }

    withNewInstanceName(name:string){
        this._newInstanceName=name;
        return this;
    }


    private determinesChildValues:ChildValueConstraint[]=[]

    addChildValueConstraint(c:ChildValueConstraint){
        this.determinesChildValues.push(c);
    }

    getChildValueConstraints():ChildValueConstraint[]{
        return this.determinesChildValues;
    }
    childRestrictions():{name:string;value:any}[]{
        return this.determinesChildValues;
    }

    _id;
    id(){
        if (this._id){
            return this._id;
        }
        if (!this._groupName){
            return null;
        }
        if (this.domain().getAdapter(RAMLService).getDeclaringNode()){
            return null;
        }
        this._id=this._groupName+this.domain().nameId();
        return this._id;
    }

    isAnnotation(){
        return this._groupName=="annotations" &&
            this.domain()&&!this.domain().isUserDefined();
    }

    withFromParentValue(v:boolean=true){
        this._isFromParentValue=v;
        return this;
    }
    withFromParentKey(v:boolean=true){
        this._isFromParentKey=v;
        return this;
    }

    isFromParentKey(){
        return this._isFromParentKey;
    }

    isFromParentValue():boolean{
        return this._isFromParentValue;
    }

    withGroupName(gname:string){
        this._groupName=gname;
        return this;
    }

    unmerge(){
        this._groupName=this.nameId();
        return this;
    }
    merge(){
        this._groupName=null;
        return this;
    }

    withKey(isKey:boolean){
        this._key=isKey;
        return this;
    }

    /**
     * TODO THIS STUFF SHOULD BE MORE ABSTRACT (LATER...)
     * @param keyShouldStartFrom
     * @returns {Property}
     */


    isKey(){
        return this._key;
    }


    isMerged(){
        return this._groupName==null;
    }



    groupName():string{
        return this._groupName;
    }

    key():typeSystem.NamedId {
        //TODO implement that
        return null
    }
}
export type Array= typeSystem.Array
export class UserDefinedProp extends Property{

    _node: IParseResult;

    _displayName:string

    withDisplayName(name:string){
        this._displayName=name;
    }
    getDisplayName(){
        return this._displayName;
    }

    node(){
        return this._node;
    }
}

export class RAMLPropertyDocumentationService{

    //!!!
    private _markdownDescription:string
    //!!!
    private _documentationTableName:string
    //!!!
    private _isHidden:boolean
    //!!!
    private _valueDescription:string

    setDocTableName(val:string){
        this._documentationTableName = val;
    }

    docTableName():string{
        return this._documentationTableName;
    }

    setHidden(val:boolean){
        this._isHidden = val;
    }

    isHidden():boolean{
        return this._isHidden;
    }

    setMarkdownDescription(val:string){
        this._markdownDescription = val;
    }

    markdownDescription():string{
        return this._markdownDescription;
    }

    setValueDescription(val:string){
        this._valueDescription = val;
    }

    valueDescription():string{
        return this._valueDescription;
    }

}

export class RAMLPropertyParserService extends RAMLPropertyDocumentationService{
    //!!!
    private _isEmbededMap:boolean
    //!!!
    private _isSystemProperty:boolean;

    isSystem(){
        return this._isSystemProperty;
    }
    withSystem(s:boolean){
        this._isSystemProperty=s;
        return this;
    }


    isEmbedMap(){
        return this._isEmbededMap
    }
    withEmbedMap(){
        this._isEmbededMap=true;
        return this;
    }
}
export class RAMLPropertyService extends RAMLPropertyParserService{
    constructor(private _property:IProperty){
        super();
        if (!_property){
            throw new Error();
        }
        super();
    }

    valueDocProvider(){
        return (<Property>this._property).valueDocProvider();
    }


    //!!!
    private _propertyGrammarType:string;

    withPropertyGrammarType(pt:string){
        this._propertyGrammarType=pt;
    }
    getPropertyGrammarType(){
        return this._propertyGrammarType;
    }

    id(){
        return this._property.nameId();
    }

    range():ITypeDefinition{
        return this._property.range();
    }
    domain():ITypeDefinition{
        return this._property.domain();
    }

    isAllowNull(){
        return (<Property>this._property).isAllowNull();
    }

    referencesTo():ITypeDefinition{
        return (<Property>this._property).referencesTo();
    }
    isReference(){
        return (<Property>this._property).isReference();
    }

    texpr:boolean;


    nameId(){
        return this._property.nameId();
    }
    priority () : number {
        if (this.isKey()) return 128;
        else if (this.isReference()) return 64;
        else if (this.isTypeExpr()) return 32;
        else if (this.nameId() == 'example') return 0;
        else return -1024;
    }
    isKey(){
        if (this._property instanceof Property) {
            return (<Property>this._property).isKey();
        }
        return false;
    }
    isMerged(){
        if (this._property instanceof Property) {
            return (<Property>this._property).isMerged();
        }
        return false;
    }
    public isTypeExpr() {
        return this.texpr;
    }

    isExampleProperty(){
        return this.example;
    }

    example:boolean;

    setExample(e:boolean){
        this.example=e;
    }
    setTypeExpression(e:boolean){
        this.texpr=e;
    }

    isDescriminating(){
        return this._property.isDescriminator();
    }

}
export declare interface ValueRequirement {
    name: string;
    value: string;

}

export class RAMLService {
    private _node:any
    private _type:ITypeDefinition;
    private _representationOf:ITypeDefinition;

    //!!!
    private _allowsAnyChildren:boolean
    //!!!
    private _allowsOptionalProperties:boolean=false;

    withAllowQuestion(){
        this._allowsOptionalProperties=true;
    }
    getAllowQuestion(){
        return this._allowsOptionalProperties;
    }
    //!!!
    private _canInherit:string[]=[];

    withCanInherit(clazz:string){
        this._canInherit.push(clazz);
    }
    //!!!???
    private _referenceIs:string;
    getReferenceIs(){
        return this._referenceIs;
    }

    withReferenceIs(fname:string){
        this._referenceIs=fname;
    }

    descriminatorValue():string{
        if (this.valueRequirements().length==0){
            return this.nameId();
        }
        return this.valueRequirements()[0].value;
    }

    getCanInherit(){
        return this._canInherit;
    }
    withAllowAny(){
        this._allowsAnyChildren=true;
    }

    getAllowAny(){
        return this._allowsAnyChildren||this._type.isExternal();
    }

    private _declaredBy:NodeClass[]=[];

    globallyDeclaredBy():NodeClass[]{
        return this._declaredBy;
    }
    setGloballyDeclaredBy(c:NodeClass){
        this._declaredBy.push(c);
    }

    setDeclaringNode(n:any){
        this._node=n;
    }

    nameId(){
        return this._type.nameId();
    }
    universe():Universe{
        return <Universe>this._type.universe();
    }

    isAssignableFrom(name:string){
        return this._type.isAssignableFrom(name);
    }

    //!!!
    _aliases:string[]=[];
    //!!!???
    _consumesRef:boolean
    //!!!???
    _defining:string[]=[]
    setConsumesRefs(b:boolean){
        this._consumesRef=b;
    }
    definingPropertyIsEnough(v:string){
        this._defining.push(v);
    }
    getDefining(){
        return this._defining;
    }

    getConsumesRefs(){
        return this._consumesRef
    }
    private _fDesc:string;

    addAlias(al:string){
        this._aliases.push(al);
    }
    getAliases(){
        return this._aliases;
    }
    valueRequirements():ValueRequirement[]{
        return this._type.valueRequirements();
    }
    //!!!???
    private _allowsValueSet:boolean
    //!!!???
    private _allowsValue:boolean
    //!!!for user types
    private _isAnnotation:boolean;
    //!!!for user types
    private _annotationChecked:boolean;
    //!!!
    private _actuallyExports:string

    isAnnotation():boolean{
        if (this._annotationChecked){
            return this._isAnnotation;
        }
        this._annotationChecked=true;
        this._isAnnotation=(this._type.allSuperTypes().some(x=>x.key()&& x.key().name=="AnnotationRef"));
        return this._isAnnotation
    }

    allowValue():boolean{
        if (this._allowsValueSet){
            return this._allowsValue;
        }
        if (this._type.allProperties().some(x=>(<Property>x).isFromParentValue()||(<Property>x).canBeValue())){
            this._allowsValue=true;
            this._allowsValueSet=true;
            return true;
        }
        this._allowsValueSet=true;
        return false;
    }

    key():Named{
        return this._type.key();
    }


    getRepresentationOf():ITypeDefinition{
        return this._representationOf;
    }


    constructor(d:ITypeDefinition){
        this._type=d;
    }

    getPath(){
        return "";
    }
    isDeclaration(){
        if (this._isTemplate){
            return true;
        }
        if (this._convertsToGlobal){
            return true;
        }
        if (this._declaresType){
            return true;
        }
        if (this.key()&&this.key().name==="Library"){
            return true;
        }
        return false;
    }
    isGlobalDeclaration():boolean{
        if (this._actuallyExports){
            return true;
        }
        if (this._isTemplate){
            return true;
        }
        if (this._declaresType){
            return true;
        }
        return false;
    }
    isTypeSystemMember(){
        return this._declaresType!=null;
    }
    getExtendedType():ITypeDefinition{
        return this.universe().type(this._declaresType)
    }
    private _runtimeExtenders:ITypeDefinition[]=[]


    setInlinedTemplates(b:boolean){
        this._isTemplate=b;
        return this;
    }

    getRuntimeExtenders():ITypeDefinition[]{
        return this._runtimeExtenders;
    }

    isInlinedTemplates(){
        return this._isTemplate;
    }
    setExtendedTypeName(name:string){
        this._declaresType=name;
        var tp=this.universe().type(name);
        if (tp instanceof NodeClass){
            var nc=<NodeClass>tp;
            nc.getAdapter(RAMLService)._runtimeExtenders.push(this._type);
        }

    }
    getKeyProp():IProperty{
        var c=this._type.allProperties();
        for (var i=0;i< c.length;i++){
            if (c[i].getAdapter(RAMLPropertyService).isKey()){
                return c[i];
            }
        }
        return null;
    }

    //!!!???
    private _declaresType:string=null;

    //!!!???
    private _convertsToGlobal:string
    //!!!
    private _isTemplate:boolean=false;
    withActuallyExports(pname:string){
        this._actuallyExports=pname;
    }
    withConvertsToGlobal(pname:string){
        this._convertsToGlobal=pname;
    }
    getConvertsToGlobal(){
        return this._convertsToGlobal;
    }
    getActuallyExports(){
        return this._actuallyExports;
    }
    isUserDefined(){
        if (this._type instanceof NodeClass) {
            return (<NodeClass>
                this._type).isUserDefined();
        }
        if (this._type instanceof AbstractType) {
            return (<AbstractType>
                this._type).isUserDefined();
        }

        return false;
    }
    //!!!
    private _contextRequirements:{name:string;value:string}[]=[]

    withContextRequirement(name:string,value:string){
        this._contextRequirements.push({name:name,value:value});
    }
    getContextRequirements(){
        return this._contextRequirements;
    }

    findMembersDeterminer():IProperty{
        var c=this._type.allProperties();
        for (var i=0;i< c.length;i++){
            if ((<Property>c[i]).isThisPropertyDeclaresTypeFields()){
                return c[i];
            }
        }
        return null;

    }


    getDeclaringNode():any{
        return this._node;
    }

    registerSupertypes(classNames:string[]){
        var universe = this._type.universe();
        classNames.forEach(x=>{
            var supertype = <AbstractType>universe.type(x);
            if(!supertype){
                return;
            }
            (<AbstractType>this._type).addSuperType(supertype);
        });
    }
}
var universes:{[key:string]:Universe}={}

var ramlDS=require("./index")

var jsonDefinitions = ramlDS.universeDumps;
import ts2def=require("./tsStruct2Def")
import unDesc=require("./universe")
export var universesInfo=unDesc;
export interface UniverseProvider{

    (key:string):Universe

    availableUniverses():string[]

    clean()
}
export var getUniverse:UniverseProvider = (()=>{

    var x:any = (key:string)=>{

        if(universes[key]){
            return universes[key];
        }

        var src = jsonDefinitions[key];
        var universe = ts2def.toDefSystem(src,(key=="RAML08")?unDesc["Universe08"]:unDesc["Universe10"]);
        if(universe) {
            universe.setUniverseVersion(key);
            universes[key] = universe;
        }
        return universe;
    }
    x.availableUniverses = function(){return Object.keys(jsonDefinitions)}
    return x;
})();
