/// <reference path="../typings/main.d.ts" />
import _=require("underscore")
import su=require("./schemaUtil")

export interface IValidationPath{

    name: string
    child?:IValidationPath

}
export class Status {

    public static CODE_CONFLICTING_TYPE_KIND = 4;

    public static ERROR = 3;

    public static INFO = 1;


    public static OK = 0;

    public static WARNING = 2;

    protected code:number;
    protected message: string;
    protected severity:number;
    protected source:any;

    protected subStatus:Status[] = [];

    protected vp:IValidationPath

    getValidationPath():IValidationPath{
        return this.vp;
    }

    getValidationPathAsString():string{
        if (!this.vp){
            return "";
        }
        var s="";
        var c=this.vp;
        while (c){
            s+= c.name;
            if (c.child){
                s+='/'
            }
            c= c.child
        }
        return s;
    }

    patchPath(p:IValidationPath):IValidationPath{
        if (!p){
            return null;
        }
        else{
            var c=p;
            var r:IValidationPath=null;
            var cp:IValidationPath=null;
            while (c){
                if (!r){
                    r={name: c.name};
                    cp=r;
                    c= c.child;
                    cp=r;
                }
                else{
                    var news= {name: c.name};
                    cp.child=news;
                    c= c.child;
                    cp=news;
                }
            }
            return r;
        }
    }
    setValidationPath(c:IValidationPath){
        if (this.vp){
            c=this.patchPath(c);
            var m=c;
            while (m.child){
                m= m.child;
            }
            m.child=this.vp;
            this.vp=c;
        }
        else {
            this.vp = c;
        }
        this.subStatus.forEach(x=>{
            x.setValidationPath(this.vp);
        })
    }

    public constructor(severity:number, code:number, message:string,source:any) {
        this.severity = severity;
        this.code = code;
        this.message = message;
        this.source=source;

    }

    addSubStatus(st:Status) {
        this.subStatus.push(st);
        if (this.severity < st.severity) {
            this.severity = st.severity;
            this.message = st.message;
        }
    }
    getErrors():Status[]{
        if (this.isError()||this.isWarning()){
            if (this.subStatus.length>0){
                var rs:Status[]=[];
                this.subStatus.forEach(x=>rs=rs.concat(x.getErrors()));
                return rs;
            }
            return [this];
        }
        return [];
    }

    getSubStatuses():Status[]{
        return this.subStatus;
    }
    getSeverity(){
        return this.severity;
    }
    getMessage() {
        return this.message;
    }
    getSource(){
        return this.source;
    }
    isWarning(){
        return this.severity==Status.WARNING;
    }
    isError(){
        return this.severity==Status.ERROR;
    }
    isOk(){
        return this.severity===Status.OK;
    }
    setSource(s:any){
        this.source=s;
    }
    toString():string{
        if (this.isOk()){
            return "OK";
        }
        return this.message;
    }
}

export const OK_STATUS=new Status(Status.OK,Status.OK,"",null);
export const SCHEMA_AND_TYPE="SCHEMA"
export const TOPLEVEL="TOPLEVEL"

export function error(message:string,source:any){
    return new Status(Status.ERROR,0,message,source);
}

export abstract class TypeInformation {

    constructor(private _inheritable:boolean){}

    _owner:AbstractType;

    owner():AbstractType{
        return this._owner;
    }

    isInheritable(){
        return this._inheritable;
    }

    validateSelf(registry:TypeRegistry):Status{
        return OK_STATUS;
    }
    abstract facetName():string
    abstract value():any;
    abstract requiredType():AbstractType
}
var stack:RestrictionStackEntry=null;

export abstract class Constraint extends TypeInformation{
    constructor(){super(true)}



    abstract check(i:any,parentPath:IValidationPath):Status


    private static intersections:{ [id:string]:AbstractType}={}

    protected intersect(t0: AbstractType,t1:AbstractType):AbstractType{
        var nm=t0.id()+""+t1.id();
        if (Constraint.intersections.hasOwnProperty(nm)){
            return Constraint.intersections[nm];
        }
        var is=intersect(nm,[t0,t1]);
        Constraint.intersections[nm]=is;
        return is;
    }

    protected release(t:AbstractType){
        delete Constraint.intersections[t.name()];
    }

    nothing(c:Constraint,message:string="Conflicting restrictions"):NothingRestrictionWithLocation{
        return new NothingRestrictionWithLocation(stack,message,c);
    }
    /**
     * inner implementation of  compute composed restriction from this and parameter restriction
     * @param restriction
     * @return  composed restriction or null;
     */
    composeWith(r: Constraint):Constraint {return null;}


    /**
     * returns optimized restiction or this
     * @returns {Constraint}
     */
    preoptimize():Constraint{
        if (stack===null){
            stack=new RestrictionStackEntry(null,null,"top");
        }
        stack=stack.push(this);
        try{
            return this.innerOptimize();
        }finally {
            stack=stack.pop();
        }
    }

    protected innerOptimize():Constraint{
        return this;
    }
    /**
     * performs attempt to compute composed restriction from this and parameter restriction
     * @param restriction
     * @return  composed restriction or null;
     */
    tryCompose(r: Constraint):Constraint{
        if (stack===null){
            stack=new RestrictionStackEntry(null,null,"top");
        }
        stack=stack.push(this);
        try{
            return this.composeWith(r);
        }finally {
            stack=stack.pop();
        }
    }
}


import restr=require("./restrictions")
import metaInfo=require("./metainfo")
import fr=require("./facetRegistry")

import {KnownPropertyRestriction} from "./restrictions";
import {FacetDeclaration} from "./metainfo";
import {CustomFacet} from "./metainfo";
import {PropertyIs} from "./restrictions";
import {ComponentShouldBeOfType} from "./restrictions";
import exO=require("./exampleBuilder")
import {NotScalar} from "./metainfo";
import {MapPropertyIs} from "./restrictions";
import {MatchesProperty} from "./restrictions";

export var autoCloseFlag=false;
/**
 * Registry of the types
 */
export class TypeRegistry {
  private _types:{[name:string]: AbstractType}={};

  private typeList:AbstractType[]=[]

  put(alias:string, t:AbstractType){
      this._types[alias]=t;
  }

  addType(t:AbstractType){
     if (t.isAnonymous()){
         return;
     }
     this._types[t.name()]=t;
     this.typeList.push(t);
  }

  get(name: string ):AbstractType{
      if (this._types.hasOwnProperty(name)){
          return this._types[name];
      }
      if (this._parent!=null){
          return this._parent.get(name);
      }
      return null;
  }

  constructor(private _parent:TypeRegistry=null){

  }

    types():AbstractType[]{
        return this.typeList;
    }
}

export class RestrictionsConflict extends Status{
    constructor(protected _conflicting:Constraint,protected _stack:RestrictionStackEntry,source:any){
        super(Status.ERROR,0,"Restrictions conflict "+_conflicting+" and "+_stack.getRestriction().toString(),source);
    }
    getConflictDescription():string{
        var rs="";
        rs+="Restrictions coflict:\n";
        rs+=this._stack.getRestriction()+" conflicts with "+this._conflicting+"\n";
        rs+="at\n";
        rs+=this._stack.pop();
        return rs;
    }

    getConflicting():Constraint{
        return this._conflicting;
    }

    getStack():RestrictionStackEntry{
        return this._stack;
    }
    toRestriction(){
        return new NothingRestrictionWithLocation(this._stack,this.message,this._conflicting);
    }
}
var globalId=0;

export abstract class AbstractType{

    protected computeConfluent: boolean

    protected metaInfo: TypeInformation[]=[];

    _subTypes: AbstractType[]=[]

    protected innerid=globalId++;

    protected extras:{ [name:string]:any}={};

    getExtra(name:string):any{
        return this.extras[name];
    }
    putExtra(name:string,v:any){
        this.extras[name]=v;
    }

    id():number{
        return this.innerid;
    }


    knownProperties():MatchesProperty[]{
        return <MatchesProperty[]>this.metaOfType(<any>MatchesProperty);
    }

    abstract kind():string;

    protected _locked:boolean=false;

    lock(){
        this._locked=true;
    }

    isLocked(){
        return this._locked;
    }

    constructor(protected _name:string){

    }

    allFacets():TypeInformation[]{
        return this.meta();
    }

    declaredFacets():TypeInformation[]{
        return this.declaredMeta();
    }

    isSubTypeOf(t:AbstractType):boolean{
        return t===ANY||this===t|| this.superTypes().some(x=>x.isSubTypeOf(t))
    }
    isSuperTypeOf(t:AbstractType):boolean{
        return this===t|| this.allSubTypes().indexOf(t)!=-1
    }
    public addMeta(info:TypeInformation){
        this.metaInfo.push(info);
        info._owner=this;
    }

    name(){
        return this._name;
    }

    /**
     * @return directly known sub types of a given type
     */
    subTypes():AbstractType[]{
        return this._subTypes;
    }
    /**
     * @return directly known super types of a given type
     */
    superTypes():AbstractType[]{
        return [];
    }

    validateType(tr:TypeRegistry=builtInRegistry()):Status{
        var rs=new Status(Status.OK,0,"",this);
        this.validateHierarchy(rs);
        if (rs.isOk()) {
            rs.addSubStatus(this.checkConfluent());

            if (this.isExternal()){
                var allS=this.allSuperTypes();
                var mma:ExternalType[]=<ExternalType[]>allS.filter(x=>x instanceof ExternalType);
                if (this instanceof ExternalType){
                    mma.push(<ExternalType><any>this);
                }
                mma.forEach(x=>{

                    if (x.isJSON()) {
                        try {
                            su.getJSONSchema(x.schema(), x.getContentProvider && x.getContentProvider());
                        } catch (e){
                            rs.addSubStatus(new Status(Status.ERROR,0, e.message,this));
                        }
                    }
                });

            }
            if (rs.isOk()) {
                this.superTypes().forEach(x=> {
                    if (x.isAnonymous()) {
                        rs.addSubStatus(x.validateType(tr))
                    }
                })
            }
        }
        if (this.getExtra(SCHEMA_AND_TYPE)){
            rs.addSubStatus(new Status(Status.ERROR,0, "schema and type are mutually exclusive",this));
        }
        this.validateMeta(tr).getErrors().forEach(x=>rs.addSubStatus(x));
        //if (this.isPolymorphic()||(this.isUnion())) {
        //    rs.addSubStatus(this.canDoAc());
        //}


        if (this.isObject()){
            var required:{ [name:string]:boolean}={};
            this.restrictions().forEach(x=>{
                if (x.owner()!=this){
                    if (x instanceof restr.HasProperty){
                        required[x.value()]=true;
                    }
                }
            });
            this.declaredMeta().forEach(x=>{
                if (x instanceof restr.HasProperty){
                    delete required[x.value()];
                }
            })
            this.declaredMeta().forEach(x=>{
                if (x instanceof restr.PropertyIs){
                    var pr:restr.PropertyIs=x;
                    if (required.hasOwnProperty(pr.propertyName())){
                        rs.addSubStatus(new Status(Status.ERROR,0,"Can not override required property:"+pr.propertyName()+" to be optional",this));
                    }
                }
            })
        }

        return rs;
    }

    public validateHierarchy(rs:Status) {
        if (this.getExtra("topLevel")&&builtInRegistry().get(this.name())){
            rs.addSubStatus(new Status(Status.ERROR, 0, "redefining builtin type:"+this.name(),this))

        }

        if (this.isSubTypeOf(RECURRENT)) {
            rs.addSubStatus(new Status(Status.ERROR, 0, "recurrent type definition",this))
        }

        if (this.isSubTypeOf(UNKNOWN)) {
            rs.addSubStatus(new Status(Status.ERROR, 0, "inheriting from unknown type",this))
        }
        if (this.isUnion()) {
            var tf = this.typeFamily();
            if (tf.some(x=>x.isSubTypeOf(RECURRENT))) {
                rs.addSubStatus(new Status(Status.ERROR, 0, "recurrent type as an option of union type",this))
            }
            if (tf.some(x=>x.isSubTypeOf(UNKNOWN))) {
                rs.addSubStatus(new Status(Status.ERROR, 0, "unknown type as an option of union type",this))
            }
        }
        if (this.isArray()) {
            var fs=this.familyWithArray();
           if ((fs.indexOf(this)!=-1)||fs.some(x=>x===UNKNOWN||x===RECURRENT)){
               rs.addSubStatus(new Status(Status.ERROR, 0, "recurrent array type definition",this))
           }
        }
        var supers=this.superTypes();
        var hasExternal:boolean=false;
        var hasNotExternal:boolean=false;

        if (supers.length>1){
            supers.forEach(x=>{
                if (x.isExternal()){
                   hasExternal=true;
                }
                else{
                    hasNotExternal=true;
                }
            })
        }
        if (hasExternal&&hasNotExternal){
            rs.addSubStatus(new Status(Status.ERROR, 0, "It is not allowed to mix RAML types with externals",this))
        }
    };

    private familyWithArray(){
        var ts=this.allSuperTypes();
        var mn=this.oneMeta(ComponentShouldBeOfType);
        if (mn){
            var at:AbstractType=mn.value();
            ts=ts.concat(at.familyWithArray());
        }
        return ts;
    }

    validateMeta(tr:TypeRegistry):Status{
        var rs=new Status(Status.OK,0,"",this);
        this.declaredMeta().forEach(x=>{
            x.validateSelf(tr).getErrors().forEach(y=>rs.addSubStatus(y))

        })

        this.validateFacets(rs);
        return rs;
    }

    private validateFacets(rs:Status) {
        var fds:{ [name : string ]: FacetDeclaration} = {}
        var super_facets:{ [name : string ]: FacetDeclaration} = {}
        var rfds:{ [name : string ]: FacetDeclaration} = {}

        this.meta().forEach(x=> {
            if (x instanceof FacetDeclaration) {
                var fd:FacetDeclaration = x;

                fds[fd.actualName()] = fd;
                if (!fd.isOptional()) {
                    if (fd.owner()!==this) {
                        rfds[fd.actualName()] = fd;
                    }
                }
                if (fd.owner()!=this){
                    super_facets[fd.actualName()]=fd;
                }

            }
        })
        this.declaredMeta().forEach(x=> {
            if (x instanceof FacetDeclaration) {
                var fd:FacetDeclaration = x;
                if (fd.owner()==this){
                    var an=fd.actualName();
                    if (super_facets.hasOwnProperty(an)){
                        rs.addSubStatus(new Status(Status.ERROR, 0, "facet :" + an+" can not be overriden",this))

                    }

                    var fp=fr.getInstance().facetPrototypeWithName(an);
                    if (fp&&fp.isApplicable(this)||an=="type"||fd.facetName()=="properties"||an=="schema"||an=="facets"){
                        rs.addSubStatus(new Status(Status.ERROR, 0, "built-in facet :" + an+" can not be overriden",this))
                    }

                    if (an.charAt(0)=='('){
                        rs.addSubStatus(new Status(Status.ERROR, 0, "facet :" + an+" can not start from '('",this))
                    }
                }
            }
        })
        var knownPropertySet:{ [name:string]:boolean}={}
        this.meta().forEach(x=> {
                if (x instanceof PropertyIs){
                    knownPropertySet[(<PropertyIs>x).propId()]=true;
                }
        });
        this.meta().forEach(x=> {
            if (x instanceof CustomFacet) {
                var cd:CustomFacet = x;
                if (fds.hasOwnProperty(cd.facetName())) {
                    var ft = fds[cd.facetName()].value();
                    rs.addSubStatus(ft.validateDirect(cd.value(),false,false));
                    delete rfds[cd.facetName()];
                }
                else {
                    rs.addSubStatus(new Status(Status.ERROR, 0, "specifying unknown facet:" + cd.facetName(),this))
                }
            }
            if (x instanceof MapPropertyIs){
                var mm:MapPropertyIs=x;
                Object.keys(knownPropertySet).forEach(c=>{
                    try {
                        if (c.match(mm.regexpValue())) {
                            rs.addSubStatus(new Status(Status.ERROR, 0, "map property " + mm.facetName() + " conflicts with property:" + c, this))
                        }
                    } catch (e){
                        //ignore incorrect regexps here
                    }
                })
            }
        })
        if (Object.getOwnPropertyNames(rfds).length > 0) {
            rs.addSubStatus(new Status(Status.ERROR, 0, "missing required facets:" + Object.keys(rfds).join(","),this))
        }
    };

    public allSuperTypes():AbstractType[]{
        var rs:AbstractType[]=[];
        this.fillSuperTypes(rs);
        return rs;
    }
    private fillSuperTypes(r:AbstractType[]){
        this.superTypes().forEach(x=>{
            if (!_.contains(r,x)) {
                r.push(x);
                x.fillSuperTypes(r);
            }
        })
    }
    public allSubTypes():AbstractType[]{
        var rs:AbstractType[]=[];
        this.fillSubTypes(rs);
        return rs;
    }
    private fillSubTypes(r:AbstractType[]){
        this.subTypes().forEach(x=>{
            if (!_.contains(r,x)) {
                r.push(x);
                x.fillSubTypes(r);
            }
        })
    }

    public inherit(name: string): InheritedType{
        var rs=new InheritedType(name);
        rs.addSuper(this);
        return rs;
    }
    /**
     *
     * @return true if type is an inplace type and has no name
     */
    isAnonymous():boolean{
        return (!this._name)||this._name.length===0;
    }
    /**
     *
     * @return true if type has no associated meta information of restrictions
     */
    isEmpty():boolean{
        if (this.metaInfo.length>1){
            return false;
        }
        return this.metaInfo.filter(x=>!(x instanceof NotScalar)).length==0;
    }

    /**
     *
     * @return true if type is an array or extends from an array
     */
    isArray():boolean{
        return this===<AbstractType>ARRAY||this.allSuperTypes().indexOf(ARRAY)!=-1;
    }
    propertySet():string[]{
        var rs:string[]=[]
        this.meta().forEach(x=>{
            if (x instanceof PropertyIs){
                var p=<PropertyIs>x;
                rs.push(p.propertyName());
            }
        });
        return _.uniq(rs);
    }

    checkConfluent():Status{
        if (this.computeConfluent){
            return OK_STATUS;
        }
        this.computeConfluent=true;
        try {
            var os = restr.optimize(this.restrictions());
            var ns=_.find(os,x=>x instanceof NothingRestriction);
            if (ns){
                var lstack:RestrictionStackEntry=null;
                var another:Constraint=null;
                if (ns instanceof NothingRestrictionWithLocation){
                    var nswl:NothingRestrictionWithLocation=ns;
                    lstack=nswl.getStack();
                    another=nswl.another();
                }
                var status=new RestrictionsConflict(another,lstack,this);
                return status;
            }
            return OK_STATUS;
        }finally {
            this.computeConfluent=false;
        }
    }
    /**
     *
     * @return true if type is object or inherited from object
     */
    isObject():boolean{
        return this==<AbstractType>OBJECT||this.allSuperTypes().indexOf(OBJECT)!=-1;
    }

    /**
     *
     * @return true if type is object or inherited from object
     */
    isExternal():boolean{
        return this==<AbstractType>EXTERNAL||this.allSuperTypes().indexOf(EXTERNAL)!=-1;
    }


    /**
     *
     * @return true if type is an boolean type or extends from boolean
     */
    isBoolean():boolean{
        return this==<AbstractType>BOOLEAN||this.allSuperTypes().indexOf(BOOLEAN)!=-1;
    }

    /**
     *
     * @return true if type is string or inherited from string
     */
    isString():boolean{
        return this==<AbstractType>STRING||this.allSuperTypes().indexOf(STRING)!=-1;
    }

    /**
     *
     * @return true if type is number or inherited from number
     */
    isNumber():boolean{
        return this==<AbstractType>NUMBER||this.allSuperTypes().indexOf(NUMBER)!=-1;
    }

    /**
     *
     * @return true if type is number or inherited from number
     */
    isFile():boolean{
        return this==<AbstractType>FILE||this.allSuperTypes().indexOf(FILE)!=-1;
    }

    /**
     *
     * @return true if type is scalar or inherited from scalar
     */
    isScalar():boolean{
        return this==<AbstractType>SCALAR||this.allSuperTypes().indexOf(SCALAR)!=-1;
    }

    /**
     *
     * @return true if type is scalar or inherited from scalar
     */
    isUnknown():boolean{
        return this==<AbstractType>UNKNOWN||this.allSuperTypes().indexOf(UNKNOWN)!=-1;
    }

    /**
     *
     * @return true if type is scalar or inherited from scalar
     */
    isRecurrent():boolean{
        return this==<AbstractType>RECURRENT||this.allSuperTypes().indexOf(RECURRENT)!=-1;
    }

    /**
     *
     * @return true if type is an built-in type
     */
    isBuiltin():boolean{
        return this.metaInfo.indexOf(BUILT_IN)!=-1;
    }
    exampleObject():any{
        return exO.example(this);
    }
    /**
     *
     * @return true if type is an polymorphic type
     */
    isPolymorphic():boolean{
        return this.meta().some(x=>x instanceof Polymorphic);
    }

    /**
     * @return all restrictions associated with type
     */
    restrictions(forValidation:boolean=false):Constraint[]{
        if (this.isUnion()){
            var rs:Constraint[]=[];
            this.superTypes().forEach(x=>{
                rs=rs.concat(x.restrictions());
            });
            rs=rs.concat(<Constraint[]>this.meta().filter(x=>x instanceof Constraint));
            return rs;
        }
        var result:Constraint[]=[];
        var generic:GenericTypeOf=null;
        this.meta().forEach(x=>{
            if (x instanceof Constraint){
                if (x instanceof  GenericTypeOf&&forValidation){
                    if (generic){
                        return;
                    }
                    generic=x;
                }
                result.push(x);
            }

        })
        return result;
    }


    customFacets():TypeInformation[]{
        return this.declaredMeta().filter(x=>x instanceof metaInfo.CustomFacet)
    }

    isUnion():boolean{
        var rs=false;
        if (this.isBuiltin()){
            return false;
        }
        this.allSuperTypes().forEach(x=>rs=rs|| x instanceof UnionType);
        return rs;
    }

    /**
     * return all type information associated with type
     */
    meta():TypeInformation[]{
        return [].concat(this.metaInfo);
    }
    /**
     * validates object against this type without performing AC
     */
    validateDirect(i:any,autoClose:boolean=false,nullAllowed:boolean=true,path:IValidationPath=null):Status{
        var result=new Status(Status.OK,0,"",this);
        if (!nullAllowed&&(i===null||i===undefined)){
            return error("object is expected",this)
        }
        this.restrictions(true).forEach(x=>result.addSubStatus(x.check(i,path)));
        if ((autoClose||autoCloseFlag)&&this.isObject()&&(!this.oneMeta(KnownPropertyRestriction))){
            var cp=new KnownPropertyRestriction(true);
            cp.patchOwner(this);
            cp.check(i).getErrors().forEach(x=>{
                var rs=new Status(Status.WARNING,0,x.getMessage(),this);
                rs.setValidationPath(x.getValidationPath())
                result.addSubStatus(rs);
            });
        }
        return  result;
    }
    validate(i:any,autoClose:boolean=false,nullAllowed:boolean=true):Status{
        var g=autoCloseFlag;
        if (!nullAllowed&&(i===null||i===undefined)){
            return error("object is expected",this)
        }
        if (autoClose){
            autoCloseFlag=true;
        }
        try {
            return this.validateDirect(i, autoClose||g);
        } finally {
            autoCloseFlag=g;
        }

    }


    /**
     * declares a pattern property on this type,
     * note if type is not inherited from an object type this will move
     * type to inconsistent state
     * @param name - regexp
     * @param type - type of the property
     * @return
     */
    declareMapProperty( name:string, type: AbstractType) {
        if (type != null) {
            this.addMeta(new restr.MapPropertyIs( name,type));
        }
        return type;
    }

    /**
     * make this type closed type (no unknown properties any more)
     */
    closeUnknownProperties(){
        this.addMeta(new KnownPropertyRestriction(true))
    }

    canDoAc():Status{
        var tf:AbstractType[]= _.uniq(this.typeFamily());
        var s=new Status(Status.OK,0,"",this);
        for (var i=0;i<tf.length;i++){
            for (var j=0;j<tf.length;j++){
                if (i!=j){
                    var t0=tf[i];
                    var t1=tf[j];
                    var ed=this.emptyIntersectionOrDiscriminator(t0,t1);
                    s.addSubStatus(ed);
                }
            }
        }
        return s;
    }

    private emptyIntersectionOrDiscriminator(t0:AbstractType, t1:AbstractType):Status {
        if (t1 === t0) {
            return OK_STATUS;
        }
        if (t1.isScalar()&&t0.isScalar()){
            return OK_STATUS;
        }
        var it = intersect("", [t0, t1]);
        var innerCheckConfluent = it.checkConfluent();
        if (innerCheckConfluent.isOk()) {
            return this.checkDiscriminator(t0, t1);

        }
        return OK_STATUS;
    }

    checkDiscriminator(t1:AbstractType, t2:AbstractType):Status {
        var found = new Status(Status.ERROR, 0, "can not discriminate types " + t1.name() + " and " + t2.name() + " without discriminator",this);
        var oneMeta = t1.oneMeta(metaInfo.Discriminator);
        var anotherMeta = t2.oneMeta(metaInfo.Discriminator);
        if (oneMeta != null && anotherMeta != null && oneMeta.value() === (anotherMeta.value())) {

            var d1 = t1.name();
            var d2 = t2.name();
            var dv1 = t1.oneMeta(metaInfo.DiscriminatorValue);
            if (dv1 != null) {
                d1 = dv1.value();
            }
            var dv2 = t2.oneMeta(metaInfo.DiscriminatorValue);
            if (dv2 != null) {
                d2 = dv2.value();
            }
            if (d1 !== d2) {
                return OK_STATUS;
            }
            found = new Status(Status.ERROR, 0,
                "types" + t1.name() + " and " + t2.name() + " have same discriminator value",this);
        }
        return found;
    }

    /**
     * performs automatic classification of the instance
     * @param obj
     * @returns {AbstractType}
     */
    ac(obj:any):AbstractType{
        if (!this.isPolymorphic()&&!this.isUnion()){
            return this;
        }

        if (this.isBuiltin()){
            return this;
        }
        var tf:AbstractType[]= _.uniq(this.typeFamily());
        if(tf.length==0){
            return NOTHING;
        }
        if (this.isScalar()) {
            if (this.isNumber()) {
                if (typeof obj =="number") {
                    return this;
                }
                return NOTHING;
            }

            if (this.isString()) {
                if (typeof obj =="string") {
                    return this;
                }
                return NOTHING;
            }

            if (this.isBoolean()) {
                if (typeof obj =="boolean") {
                    return this;
                }
                return NOTHING;
            }
            return this;
        }
        if (tf.length===1){
            return tf[0];
        }
        var options:AbstractType[]=[];
        tf.forEach(x=>{
            var ds=x.validateDirect(obj,true);
            if (ds.isOk()){
                options.push(x);
            }
        })
        var t= this.discriminate(obj,options);
        if (!t){
            return NOTHING;
        }
        return t;
    }
    /**
     * adds new property declaration to this type, note if type is not inherited from an object type this will move
     * type to inconsistent state
     * @param name - name of the property
     * @param type - type of the property
     * @param optional true if property is optinal
     * @return the type with property (this)
     */
    declareProperty(name:string , t:AbstractType,optional: boolean):AbstractType{
        if (!optional){
            this.addMeta(new restr.HasProperty(name));
        }
        if (t!=null){
            this.addMeta(new restr.PropertyIs(name,t));
        }
        return this;
    }

    private discriminate(obj:any, opt:AbstractType[]):AbstractType{
        var newOpts:AbstractType[]=[].concat(opt);
        var opts:AbstractType[]=[].concat(opt);
        while (newOpts.length>1){
            var found=false;
            l2: for (var i=0;i<opts.length;i++){
                for (var j=0;j<opts.length;j++){
                    var t0=opts[i];
                    var t1=opts[j];
                    if (t0!=t1){
                        var nt=select(obj,t0,t1);
                        if (nt===t0){
                            opts=opts.filter(x=>x!=t1);
                            found=true;
                            break l2;
                        }
                        else if (nt===t1){
                            opts=opts.filter(x=>x!=t0);
                            found=true;
                            break l2;
                        }
                        else{
                            opts=opts.filter(x=>x!=t0&&x!=t1);
                            found=true;
                            break l2;
                        }
                    }
                }
            }
            newOpts=opts;
        }
        if (newOpts.length==1){
            return newOpts[0];
        }
        return null;
    }

    /**
     * return instance of type information of particular class
     * @param clazz
     * @returns {any}
     */
    oneMeta<T>(clazz:{ new(v:any):T } ):T{
        return <T>_.find(<any>this.meta(),x=>x instanceof clazz);
    }



    /**
     * return all instances of meta information of particular class
     * @param clazz
     * @returns {any}
     */
    metaOfType<T>(clazz:{ new(v:any):T } ):T[]{
        return <any>this.meta().filter(x=>x instanceof clazz);
    }


    declaredMeta():TypeInformation[]{
        return this.metaInfo;
    }

    descValue():any{
        var dv=this.oneMeta(metaInfo.DiscriminatorValue);
        if (dv){
            return dv.value();
        }
        return this.name();
    }

    isAbstractOrInternal():boolean{
        return this.metaInfo.some(x=>x instanceof Abstract||x instanceof Internal)
    }

    public  typeFamily():AbstractType[] {
        if (this.isUnion()){
            var res:AbstractType[]=[]
            this.allSuperTypes().forEach(x=>{
                if (x instanceof UnionType){
                    var opts=x.allOptions();
                    for (var i=0;i<opts.length;i++){
                        res=res.concat(opts[i].typeFamily());
                    }
                }
            })
            return _.unique(res);
        }
        var rs:AbstractType[]=[];
        if (!this.isAbstractOrInternal()){
            rs.push(this);
        }
        this.allSubTypes().forEach(x=>{
            if (!x.isAbstractOrInternal()){
                rs.push(x);
            }
        })
        return _.unique(rs);
    }
}

export abstract class Modifier extends TypeInformation{

    requiredType(){
        return ANY;
    }
}
export class Polymorphic extends Modifier{

    constructor(){super(true)}
    facetName(){
        return "polymorphic";
    }

    value(){
        return true;
    }
}
export class Abstract extends Modifier{

    constructor(){super(false)}

    value(){
        return true;
    }

    facetName(){
        return "abstract"
    }
}
export class Internal extends Modifier{
    constructor(){super(false)}


    facetName(){
        return "abstract"
    }

    value(){
        return true;
    }
}

class BuiltIn extends Modifier{

    constructor(){super(false)}

    facetName(){
        return "builtIn"
    }
    value(){
        return true;
    }
}

var BUILT_IN=new BuiltIn();


export class RootType extends AbstractType{

    kind(){
        return "root";
    }
}

export class InheritedType extends AbstractType{

    protected _superTypes: AbstractType[]=[]

    superTypes(){
        return this._superTypes;
    }

    knownProperties():MatchesProperty[]{
        var vs= <MatchesProperty[]>this.metaOfType(<any>MatchesProperty);
        this.superTypes().forEach(x=>{
            vs=vs.concat(x.knownProperties());
        })
        return vs;
    }

    kind(){
        return "inherited"
    }
    meta():TypeInformation[]{
        var rs=super.meta();
        var hasKp=false;
        this.superTypes().forEach(x=>{
            x.meta().forEach(m=>{
                if (m instanceof KnownPropertyRestriction){
                    if (hasKp){
                        return;
                    }
                    var kp=new KnownPropertyRestriction(true);
                    kp.patchOwner(this);
                    rs.push(kp);
                    return;
                }
                if (m.isInheritable()){
                    rs.push(m);
                }
            })
        })
        return rs;
    }

    addSuper(t: AbstractType){
        this._superTypes.push(t);
        if (!t.isLocked()) {
            t._subTypes.push(this);
        }
    }

}
export abstract class DerivedType extends AbstractType{

    constructor(name: string,private _options:AbstractType[]){
        super(name);
    }

    /**
     *
     * @returns all possible options
     */
    allOptions():AbstractType[]{
        var rs:AbstractType[]=[];
        this._options.forEach(x=>{
            if (x.kind()==this.kind()){
                rs=rs.concat((<DerivedType>x).allOptions());
            }
            else{
                rs.push(x);
            }
        });
        return _.unique(rs);
    }
    options():AbstractType[]{
        return this._options;
    }

}
export class UnionType extends DerivedType{

    kind(){
        return "union"
    }
    isSubTypeOf(t:AbstractType):boolean{
        var isSubType=true;
        this.allOptions().forEach(x=>{
            if (!x.isSubTypeOf(t)){
                isSubType=false
            }
        })
        return isSubType;
        //return t===ANY||this===t|| this.superTypes().some(x=>x.isSubTypeOf(t));
    }

    validate(i:any):Status{
        return this.validateDirect(i);
    }

    public typeFamily():AbstractType[] {
        var res:AbstractType[]=[];
        this.allOptions().forEach(x=>{
            res=res.concat(x.typeFamily());
        });
        return res;
    }
    knownProperties():MatchesProperty[]{
        var vs= <MatchesProperty[]>this.metaOfType(<any>MatchesProperty);
        this.options().forEach(x=>{
            vs=vs.concat(x.knownProperties());
        })
        return vs;
    }

    validateDirect(i:any,autoClose:boolean=false):Status {
        var st=new Status(Status.OK,0,"",this);
        var options:Status=null;
        for (var j=0;j<this.options().length;j++){
            var s=this.options()[j].validateDirect(i,autoClose);
            if (s.isOk()){
                return s;
            }
            options=s;
        }

        st.addSubStatus(options);
        return st;
    }

    isUnion(){
        return true;
    }

    restrictions(){
        return [new OrRestriction(this.allOptions().map(x=>new AndRestriction(x.restrictions())),"union type options does not pass validation")]
    }
}
export class IntersectionType extends DerivedType{

    kind(){
        return "intersection";
    }

    restrictions(){
        var rs:Constraint[]=[];
        this.allOptions().forEach(x=>rs=rs.concat(x.restrictions()));
        return [new AndRestriction(rs)]
    }
}

const registry=new TypeRegistry();
export function builtInRegistry():TypeRegistry{
    return registry;
}


export function union(name:string, t:AbstractType[]):UnionType{
    return new UnionType(name,t);
}
export function intersect(name:string, t:AbstractType[]):IntersectionType{
    return new IntersectionType(name,t);
}
/**
 * allows you to extend a type from other types
 * @param name
 * @param t
 * @returns {InheritedType}
 */
export function derive(name: string,t:AbstractType[]):InheritedType{
    var r=new InheritedType(name);
    t.forEach(x=>r.addSuper(x));
    return r;
}
/**
 * this function allows you to quickly derive a new type from object;
 * @param name
 * @returns {InheritedType}
 */
export function deriveObjectType(name: string):InheritedType{
    return derive(name,[OBJECT]);
}


function select(obj:any,t0:AbstractType,t1:AbstractType):AbstractType{
    if (t0.isScalar()&&t1.isScalar()){
        if (t0.allSubTypes().indexOf(t1)!=-1){
            return t0;
        }
        if (t1.allSubTypes().indexOf(t0)!=-1){
            return t1;
        }
    }
    var d0=t0.oneMeta(metaInfo.Discriminator);
    var d1=t1.oneMeta(metaInfo.Discriminator);
    if (d0&&d1){
        if (d0.property===d1.property){
            var v0=t0.descValue();
            var v1=t1.descValue();
            if (v0!==v1){
                var val=obj[d0.property];
                if (val===v0){
                    return t0;
                }
                if (val===v1){
                    return t1;
                }
            }
        }
    }
    return null;
}

export class NothingRestriction extends Constraint{
    check(i:any):Status {
        if (i===null||i===undefined){
            return OK_STATUS;
        }
        return error("nothing ",this);
    }


    requiredType(){
        return ANY;
    }

    facetName(){
        return "nothing";
    }

    value(){
        return "!!!"
    }
}
export class RestrictionStackEntry{

    constructor(private _previous:RestrictionStackEntry,private _restriction:Constraint,private id:string){

    }

    getRestriction(){return this._restriction}

    pop(){return this._previous;}

    push(r:Constraint){
        return new RestrictionStackEntry(this,r, r.toString());
    }
}
export  class NothingRestrictionWithLocation extends NothingRestriction{


    constructor(private _entry:RestrictionStackEntry,private _message:string,private _another:Constraint){
        super();
    }
    getMessage(){return this._message;}

    getStack(){return this._entry;}

    another(){return this._another;}
}

export abstract class GenericTypeOf extends Constraint{

}

export class TypeOfRestriction extends GenericTypeOf{

    constructor(private val: string){
        super();
    }
    check(i:any):Status {

            var to = typeof i;
            if (i===null||i===undefined){
                return OK_STATUS;
            }
            if (Array.isArray(i)) {
                to = "array";
            }
            if (to === this.val) {
                return OK_STATUS;
            }
            return error(this.val+" is expected",this);

    }

    value(){
        return this.val;
    }


    requiredType(){
        return ANY;
    }

    facetName(){
        return "typeOf"
    }

    composeWith(r:Constraint):Constraint{
        if (r instanceof TypeOfRestriction){
            var to:TypeOfRestriction=r;
            if (to.val==this.val){
                return this;
            }
            return this.nothing(r);
        }
        return null;
    }

    toString(){
        return "should be of type "+this.val;
    }
}
function is_int(value:any){
    if((parseFloat(value) == parseInt(value)) && !isNaN(value)){
        return true;
    } else {
        return false;
    }
}
export class IntegerRestriction extends GenericTypeOf{

    constructor(){
        super();
    }
    check(i:any):Status {
        if (typeof i=="number"&&is_int(i)){
            return OK_STATUS;
        }
        return error("integer is expected",this);
    }

    requiredType(){
        return ANY;
    }
    facetName(){
        return "should be integer"
    }

    value(){
        return true;
    }
}
export class ScalarRestriction extends GenericTypeOf{

    constructor(){
        super();
    }
    check(i:any):Status {
        if (!i){
            return OK_STATUS;
        }
        if (typeof i==='number'||typeof i==='boolean'||typeof i==='string'){
            return OK_STATUS;
        }
        return error("scalar is expected",this);
    }

    requiredType(){
        return ANY;
    }
    facetName(){
        return "should be scalar"
    }

    value(){
        return true;
    }
}


export class OrRestriction extends Constraint{

    constructor(private val: Constraint[],private _extraMessage?:string){
        super();
    }

    check(i:any,p:IValidationPath):Status {
        var cs=new Status(Status.OK,0,"",this);
        var first:Status=null;
        for (var j=0;j<this.val.length;j++){
            var m=this.val[j].check(i,p);
            if (m.isOk()){
                return OK_STATUS;
            }
            if (!first){
                first=m;
            }
            ;
        }
        if (first){
            cs.addSubStatus(first);
            if (this._extraMessage){
                cs.addSubStatus(error(this._extraMessage,this));
            }
        }
        return cs;
    }
    value(){
        return this.val.map(x=>x.value());
    }
    requiredType(){
        return ANY;
    }
    facetName(){
        return "or"
    }
}
export class AndRestriction extends Constraint{

    constructor(private val: Constraint[]){
        super();
    }
    value(){
        return this.val.map(x=>x.value());
    }
    options(){
        return this.val;
    }
    check(i:any,p:IValidationPath):Status {
        for (var j=0;j<this.val.length;j++){
            var st=this.val[j].check(i,p);
            if (!st.isOk()){
                return st;
            }
        }
        return OK_STATUS;
    }
    requiredType(){
        return ANY;
    }

    facetName(){
        return "and";
    }
}
/***
 *
 * lets declare built in types
 */

export const ANY=new RootType("any");
export const SCALAR=ANY.inherit("scalar");
export const OBJECT=ANY.inherit("object");
//export const POLYMORPHIC=OBJECT.inherit("polymorphic");

export const ARRAY=ANY.inherit("array");
export const EXTERNAL=ANY.inherit("external");
export const NUMBER=SCALAR.inherit("number");
export const INTEGER=NUMBER.inherit("integer");
export const BOOLEAN=SCALAR.inherit("boolean");
export const STRING=SCALAR.inherit("string");
export const DATE=SCALAR.inherit("date");
export const FILE=SCALAR.inherit("file");
export const NOTHING=new RootType("nothing");
export const UNION=ANY.inherit("union");
export const UNKNOWN=NOTHING.inherit("unknown");
export const RECURRENT=NOTHING.inherit("recurrent");


///
//POLYMORPHIC.addMeta(new Polymorphic())
ANY.addMeta(BUILT_IN);
UNION.addMeta(BUILT_IN);
SCALAR.addMeta(BUILT_IN);
OBJECT.addMeta(BUILT_IN);
ARRAY.addMeta(BUILT_IN);
NUMBER.addMeta(BUILT_IN);
INTEGER.addMeta(BUILT_IN);
BOOLEAN.addMeta(BUILT_IN);
STRING.addMeta(BUILT_IN);
DATE.addMeta(BUILT_IN);
FILE.addMeta(BUILT_IN);
//POLYMORPHIC.addMeta(BUILT_IN);
UNKNOWN.addMeta(BUILT_IN);
UNKNOWN.lock();
RECURRENT.addMeta(BUILT_IN);
RECURRENT.lock();
EXTERNAL.lock();
UNION.lock();

///lets register all types in registry

registry.addType(ANY);
registry.addType(SCALAR);
registry.addType(OBJECT);
registry.addType(ARRAY);
registry.addType(NUMBER);
registry.addType(INTEGER);
registry.addType(BOOLEAN);
registry.addType(STRING);
registry.addType(DATE);
registry.addType(FILE);
//registry.addType(POLYMORPHIC);

NOTHING.addMeta(new NothingRestriction());
NUMBER.addMeta(new TypeOfRestriction("number"));
NUMBER.addMeta(new FacetDeclaration("format",STRING,true));
BOOLEAN.addMeta(new TypeOfRestriction("boolean"));
OBJECT.addMeta(new TypeOfRestriction("object"));
ARRAY.addMeta(new TypeOfRestriction("array"));
STRING.addMeta(new TypeOfRestriction("string"));
INTEGER.addMeta(new IntegerRestriction());
DATE.addMeta(new TypeOfRestriction("string"));
FILE.addMeta(new TypeOfRestriction("string"));
var arrayOfString=ARRAY.inherit("");
arrayOfString.addMeta(new ComponentShouldBeOfType(STRING))
FILE.addMeta(new FacetDeclaration("fileTypes",arrayOfString,true));
FILE.addMeta(new FacetDeclaration("minLength",INTEGER,true));
FILE.addMeta(new FacetDeclaration("maxLength",INTEGER,true));

SCALAR.addMeta(new ScalarRestriction());
registry.types().forEach(x=>x.lock())

export class ExternalType extends InheritedType{
    constructor( name: string,private _content:string,private json:boolean, private provider: su.IContentProvider){
        super(name);
        this.addMeta(new restr.MatchToSchema(_content, provider));
        this.addSuper(EXTERNAL);
    }

    getContentProvider() {
        return this.provider;
    }

    setContentProvider(provider: su.IContentProvider) {
        this.provider = provider;
    }

    kind():string{
        return "external";
    }
    isJSON(){
        return this.json;
    }

    schema(){
        return this._content;
    }

}