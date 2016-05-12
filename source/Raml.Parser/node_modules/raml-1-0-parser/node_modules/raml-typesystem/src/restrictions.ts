/// <reference path="../typings/main.d.ts" />
import ts=require("./typesystem")
import su=require("./schemaUtil")
import _= require("underscore");
import {AndRestriction} from "./typesystem";
import {Constraint} from "./typesystem";
import {AbstractType} from "./typesystem";
import {Status} from "./typesystem";
import {autoCloseFlag} from "./typesystem";
export type IValidationPath=ts.IValidationPath;
/**
 * this class is an abstract super type for every constraint that can select properties from objects
 */
export abstract class MatchesProperty extends ts.Constraint{
     matches(s:string):boolean{
         return false;
     }

    constructor(private _type:ts.AbstractType){super()}

    check(i:any,p:ts.IValidationPath):ts.Status{
        throw new Error("Should be never called");
    }

    patchPath(p:ts.IValidationPath):IValidationPath{
        if (!p){
            return { name: this.propId()};
        }
        else{
            var c=p;
            var r:IValidationPath=null;
            var cp:IValidationPath=null;
            while (c){
                if (!r){
                    r={name: c.name};
                    cp=r;
                }
                else{
                    var news= {name: c.name};
                    cp.child=news;
                    c= c.child;
                    cp=news;
                }
            }
            r.child={name:this.propId()};
            return r;
        }
    }

    validateProp(i: any,n:string, t:ts.AbstractType,q:ts.IValidationPath){
        var vl=i[n];
        if (vl!==null&&vl!==undefined){

            var st=t.validate(vl,true,false);
            if (!st.isOk()){
                if (t.isUnknown()|| t.isRecurrent()){
                    var s=new Status(Status.ERROR,0,"Validating instance against unknown type:"+ t.name(),this);
                    s.setValidationPath(this.patchPath(q));
                    return s;
                }
                var s=new Status(Status.OK,0,"",this);
                st.getErrors().forEach(x=>s.addSubStatus(x));
                s.setValidationPath(this.patchPath(q));
                return s;
            }
        }
        return ts.OK_STATUS;
    }

    abstract propId():string


    validateSelf(registry:ts.TypeRegistry):ts.Status {
        if (this._type.isAnonymous()){
            var st=this._type.validateType(registry);
            if (!st.isOk()){
                var p= new Status(Status.ERROR,0,"property "+this.propId()+" range type has error:"+st.getMessage(),this)
                p.setValidationPath({name: this.propId()})
                return p;
            }
            return st;
        }
        if (this._type.isExternal()){
            var p= new Status(Status.ERROR,0,"It is not allowed to use external types in property definitions",this)
            p.setValidationPath({name: this.propId()})
            return p;
        }
        if (this._type.isSubTypeOf(ts.UNKNOWN)||this._type.isSubTypeOf(ts.RECURRENT)){
            var p= new Status(Status.ERROR,0,"property "+this.propId()+" refers to unknown type "+this._type.name(),this)
            p.setValidationPath({name: this.propId()})
            return p;
        }
        if (this._type.isUnion()){
           var ui= _.find(this._type.typeFamily(),x=>x.isSubTypeOf(ts.UNKNOWN));
           if (ui){
               var p=new Status(Status.ERROR,0,"property "+this.propId()+" refers to unknown type "+ui.name(),this);
               p.setValidationPath({name: this.propId()})
               return p;
           }
        }
        return ts.OK_STATUS;
    }
}

export class MatchToSchema extends  ts.Constraint{

    constructor(private _value:string, private provider: su.IContentProvider){
        super();
    }
    value(){
        return this._value;
    }
    check(i:any):ts.Status{
        var so:su.Schema=null;
        var strVal=this.value();
        if (strVal.charAt(0)=="{"){
            try {
                so = su.getJSONSchema(strVal, this.provider);
            } catch (e){
                return new ts.Status(ts.Status.ERROR,0,"Incorrect schema :"+ e.message,this);
            }
        }
        if (strVal.charAt(0)=="<"){
            try {
                so = su.getXMLSchema(strVal);
            } catch (e){
                return ts.OK_STATUS;
            }
        }
        if(so){
            try {
                so.validateObject(i);
            }catch(e){
                if (e.message=="Cannot assign to read only property '__$validated' of object"){
                    return ts.OK_STATUS;
                }
                if (e.message=="Object.keys called on non-object"){
                    return ts.OK_STATUS;
                }
                return new ts.Status(ts.Status.ERROR,0,"Example does not conform to schema:"+e.message,this);
            }
            //validate using classical schema;
        }
        return ts.OK_STATUS;
    }


    facetName(){
        return "schema";
    }

    requiredType(){
        return ts.EXTERNAL;
    }
}
/**
 * this is a constraint which checks that object has no unknown properties if at has not additional properties
 */
export class KnownPropertyRestriction extends ts.Constraint{



    facetName(){
        return "closed"
    }

    requiredType(){
        return ts.OBJECT;
    }

    value(){
        return true;
    }

    constructor(private _value: boolean){
        super();
    }

    patchOwner(t:AbstractType){
        this._owner=t;
    }

    check(i:any):ts.Status{

        if (this._value) {
            if (i&&typeof  i == 'object') {
                var nm:{ [name:string]:boolean} = {};
                Object.getOwnPropertyNames(i).forEach(n=>nm[n] = true);
                var mp:MatchesProperty[] = <MatchesProperty[]>this.owner().knownProperties();
                Object.getOwnPropertyNames(i).forEach(p=> {
                    mp.forEach(v=> {
                        if (v.matches(p)) {
                            delete nm[p];
                        }
                    });
                })

                if (Object.keys(nm).length > 0&&mp.length>0) {
                    var s=new ts.Status(ts.Status.OK,0,"",this);
                    Object.keys(nm).forEach(x=>{
                        var err=ts.error("Unknown property:"+x,this);
                        err.setValidationPath({name:x});
                        s.addSubStatus(err)}
                    );
                    return s;
                }
            }
        }
        return ts.OK_STATUS;
    }
    composeWith(restriction:Constraint):Constraint{
        if (!this._value){
            return null;
        }
        if (restriction instanceof KnownPropertyRestriction) {
            var  mm = <KnownPropertyRestriction> restriction;
            if (_.isEqual(this.owner().propertySet(),mm.owner().propertySet())) {
                return mm;
            }
        }
        if (restriction instanceof HasProperty) {
            var  ps = <HasProperty> restriction;
            var name = ps.value();
            var allowedPropertySet = this.owner().propertySet();
            if (allowedPropertySet.indexOf(name)==-1) {
                return this.nothing(ps);
            }
        }
    }
}
/**
 * this constaint checks that object has a particular property
 */
export class HasProperty extends ts.Constraint{

    constructor(private name: string){
        super();
    }
    check(i:any):ts.Status{
        if (i&&typeof i=='object'&&!Array.isArray(i)) {
            if (i.hasOwnProperty(this.name)) {
                return ts.OK_STATUS;
            }
            return ts.error("Required property: " + this.name+" is missed",this);
        }
        return ts.OK_STATUS;
    }

    requiredType(){
        return ts.OBJECT;
    }

    facetName(){
        return "hasProperty"
    }

    value(){
        return this.name;
    }

    composeWith(r:Constraint):Constraint{
        if (r instanceof  HasProperty){
            var hp:HasProperty=r;
            if (hp.name===this.name){
                return this;
            }
        }
        return null;
    }
}

/**
 * this constraint checks that property has a particular tyoe if exists
 */
export class PropertyIs extends MatchesProperty{

    constructor(private name: string,private type:ts.AbstractType){
        super(type);
    }
    matches(s:string):boolean{
        return s===this.name;
    }

    check(i:any,p:ts.IValidationPath):ts.Status{
        if (i && typeof i==="object") {
            if (i.hasOwnProperty(this.name)) {
                var st = this.validateProp(i, this.name, this.type,p);
                return st;
            }
        }
        return ts.OK_STATUS;
    }
    requiredType(){
        return ts.OBJECT;
    }
    propId(): string{
        return this.name;
    }

    propertyName(){
        return this.name;
    }

    facetName(){
        return "propertyIs"
    }
    value(){
        return this.type;
    }

    composeWith(t:ts.Constraint):ts.Constraint{
        if (t instanceof PropertyIs){
            var pi:PropertyIs=t;
            if (pi.name===this.name){
                if (this.type.typeFamily().indexOf(pi.type)!=-1){
                    return pi;
                }
                if (pi.type.typeFamily().indexOf(this.type)!=-1){
                    return this;
                }
                    var intersectionType = this.intersect(this.type, pi.type);
                try {
                    var is:ts.Status = intersectionType.checkConfluent();
                    if (!is.isOk()) {
                        var rc=<ts.RestrictionsConflict>is;
                        return rc.toRestriction();
                    }
                    return new PropertyIs(this.name, intersectionType);
                }finally {
                    this.release(intersectionType);
                }
            }
        }
        return null;
    }
}
/**
 * this cosnstraint checks that map property values passes to particular type if exists
 */
export class MapPropertyIs extends MatchesProperty{

    constructor(private regexp: string,private type:ts.AbstractType){
        super(type);
    }
    matches(s:string):boolean{
       if (s.match(this.regexp)){
           return true;
       }
        return false;
    }

    requiredType(){
        return ts.OBJECT;
    }
     propId():string{
         return '['+this.regexp+']'
     }

    facetName(){
        return "mapPropertyIs"
    }

    value(){
        return this.type;
    }
    regexpValue(){
        return this.regexp;
    }
    validateSelf(t:ts.TypeRegistry):ts.Status{
        var m=this.checkValue();
        if (m){
            return new Status(Status.ERROR,0,m,this);
        }
        return super.validateSelf(t);
    }
    checkValue(){
        try{
            new RegExp(this.regexp);
        }
        catch (e){
            return e.message;
        }
        return null;
    }
    composeWith(t:ts.Constraint):ts.Constraint{
        if (t instanceof MapPropertyIs){
            var pi:MapPropertyIs=t;
            if (pi.regexp===this.regexp){
                if (this.type.typeFamily().indexOf(pi.type)!=-1){
                    return pi;
                }
                if (pi.type.typeFamily().indexOf(this.type)!=-1){
                    return this;
                }
                var intersectionType = this.intersect(this.type, pi.type);
                try {
                    var is:ts.Status = intersectionType.checkConfluent();
                    if (!is.isOk()) {
                        var rc=<ts.RestrictionsConflict>is;
                        return rc.toRestriction();
                    }
                    return new MapPropertyIs(this.regexp, intersectionType);
                }finally {
                    this.release(intersectionType);
                }
            }
        }
        return null;
    }

    check(i:any,p:ts.IValidationPath):ts.Status{
        if (i) {
            if (typeof i == 'object') {
                var rs:ts.Status = new ts.Status(ts.Status.OK, 0, "",this);
                Object.getOwnPropertyNames(i).forEach(n=> {
                    if (n.match(this.regexp)) {
                        var stat = this.validateProp(i, n, this.type,p);
                        if (!stat.isOk()) {
                            rs.addSubStatus(stat);
                        }
                    }
                });
                return rs;
            }
        }
        return ts.OK_STATUS;
    }
}
/**
 * this constraint tests that additional property
 */
export class AdditionalPropertyIs extends MatchesProperty{

    constructor(private type:ts.AbstractType){
        super(type);
    }
    matches(s:string):boolean{
        return true;
    }

    requiredType(){
        return ts.OBJECT;
    }
    propId():string{
        return '[]'
    }


    facetName(){
        return "additionalProperties"
    }
    value(){
        return this.type;
    }
    match(n:string):boolean{
        var all:PropertyIs[]=<any>this.owner().metaOfType(<any>PropertyIs);
        var map:MapPropertyIs[]=<any>this.owner().metaOfType(<any>MapPropertyIs);
        for (var i=0;i<all.length;i++){
            if (all[i].matches(n)){
                return true;
            }
        }
        for (var i=0;i<map.length;i++){
            if (map[i].matches(n)){
                return true;
            }
        }
        return false;
    }
    composeWith(t:ts.Constraint):ts.Constraint{
        if (t instanceof AdditionalPropertyIs){
            var pi:AdditionalPropertyIs=t;

            if (this.type.typeFamily().indexOf(pi.type)!=-1){
                return pi;
            }
            if (pi.type.typeFamily().indexOf(this.type)!=-1){
                return this;
            }
            var intersectionType = this.intersect(this.type, pi.type);
            try {
                var is:ts.Status = intersectionType.checkConfluent();
                if (!is.isOk()) {
                    var rc=<ts.RestrictionsConflict>is;
                    return rc.toRestriction();
                }
                return new AdditionalPropertyIs( intersectionType);
            }finally {
                this.release(intersectionType);
            }

        }
        return null;
    }
    check(i:any,p:ts.IValidationPath):ts.Status{
        var t=this.type;
        var res=new ts.Status(ts.Status.OK,0,"",this);
        if (i&&typeof i==="object") {
            Object.getOwnPropertyNames(i).forEach(n=> {
                if (!this.match(n)) {
                    var stat = this.validateProp(i, n, t,p);
                    if (!stat.isOk()) {
                        res.addSubStatus(stat);
                    }
                }
            });
        }
        return res;
    }
}
/**
 * common super type for a simple restrictions
 */
export abstract class FacetRestriction<T> extends ts.Constraint{

    abstract facetName():string
    abstract requiredType():ts.AbstractType;

    abstract checkValue():string
    abstract value():T;


    validateSelf(registry:ts.TypeRegistry):ts.Status{
        if (!this.owner().isSubTypeOf(this.requiredType())){
            var rs= ts.error(this.facetName()+" facet can only be used with "+this.requiredType().name()+" types",this);
            rs.setValidationPath({name:this.facetName()});
            return rs;
        }
        var m=this.checkValue();
        if (m){
            var rs= ts.error(m,this);
            rs.setValidationPath({name:this.facetName()});
            return rs;
        }
        return ts.OK_STATUS;
    }

}
function is_int(value:any){
    if((parseFloat(value) == parseInt(value)) && !isNaN(value)){
        return true;
    } else {
        return false;
    }
}
/**
 * abstract super type for every min max restriction
 */
export abstract class MinMaxRestriction extends FacetRestriction<Number>{

    constructor(private _facetName:string,private _value:number,private _max:boolean,private _opposite:string,
                private _requiredType:ts.AbstractType,private _isInt:boolean){
        super();
    }


    facetName():string {
        return this._facetName;
    }

    isIntConstraint(){
        return this._isInt;
    }
    isMax(){
        return this._max;
    }
    abstract extractValue(i:any): number;
    value(){
        return this._value;
    }

    check(i:any):ts.Status{
        var o=this.extractValue(i);
        if (typeof  o=='number'){
            if (this.isMax()){
                if (this.value()<o){
                    return this.createError();
                }
            }
            else{
                if (this.value()>o){
                    return this.createError();
                }
            }
        }
        return ts.OK_STATUS;
    }
    createError():ts.Status{
        return ts.error(this.toString(),this);
    }

    minValue(){
        if (this._isInt){
            return 0;
        }
        return Number.NEGATIVE_INFINITY;
    }
    requiredType():ts.AbstractType{
        return this._requiredType;
    }

    checkValue():string{
        if (typeof this._value !="number"){
            return this.facetName()+" should be a number";
        }
        if (this.isIntConstraint()){
            if (!is_int(this.value())){
                return this.facetName()+" should be a integer";
            }
        }
        if (this.value()<this.minValue()){
            return this.facetName()+" should be at least "+this.minValue();
        }
    }

    composeWith(t:ts.Constraint):ts.Constraint{
        if (t instanceof MinMaxRestriction) {
            var mx = <MinMaxRestriction>t;
            if (mx.facetName() == this.facetName()) {
                if (mx.isMax() == this.isMax()) {
                    if (this.isMax()){
                        if (this.value()<mx.value()){
                            return mx;
                        }
                        else{
                            return this;
                        }
                    }
                    else{
                        if (this.value()>mx.value()){
                            return mx;
                        }
                        else{
                            return this;
                        }
                    }
                }
            }
            if (mx.facetName()===this._opposite){
                if (this.isMax()) {
                    if (mx.value() > this.value()) {
                        return this.nothing(t);
                    }
                }
                else{
                    if (mx.value() < this.value()) {
                        return this.nothing(t);
                    }
                }
            }
        }
        return null;
    }
}
/**
 * maximum  constraint
 */
export class Maximum extends  MinMaxRestriction{
    constructor(val: number){
        super("maximum",val,true,"minimum",ts.NUMBER,false);
    }


    extractValue(i:any):number {
        return i;
    }

    toString(){
        return "value should be not more then " + this.value();
    }
}
/**
 * minimum constraint
 */
export class Minimum extends  MinMaxRestriction{
    constructor(val: number){
        super("minimum",val,false,"maximum",ts.NUMBER,false);
    }


    extractValue(i:any):number {
        return i;
    }

    toString(){
        return "value should be not less then " + this.value();
    }
}
/**
 * max items cosntraint
 */
export class MaxItems extends  MinMaxRestriction{
    constructor(val: number){
        super("maxItems",val,true,"minItems",ts.ARRAY,true);
    }


    extractValue(i:any):number {
        if (Array.isArray(i)) {
            return i.length;
        }
    }

    toString(){
        return "array should have not more then " + this.value()+" items";
    }
}
/**
 * min items cosntraint
 */
export class MinItems extends  MinMaxRestriction{
    constructor(val: number){
        super("minItems",val,false,"maxItems",ts.ARRAY,true);
    }


    extractValue(i:any):number {
        if (Array.isArray(i)) {
            return i.length;
        }
    }

    toString(){
        return "array should have not less then " + this.value()+" items";
    }
}
/**
 * max length
 */
export class MaxLength extends  MinMaxRestriction{
    constructor(val: number){
        super("maxLength",val,true,"minLength",ts.STRING,true);
    }


    extractValue(i:any):number {
        if (typeof i=='string') {
            return i.length;
        }
        return 0;
    }

    toString(){
        return "string length should be not more then " + this.value();
    }
}

/**
 * min length
 */
export class MinLength extends  MinMaxRestriction{
    constructor(val: number){
        super("minLength",val,false,"maxLength",ts.STRING,true);
    }

    extractValue(i:any):number {
        if (typeof i=='string') {
            return i.length;
        }
        return 0;
    }

    toString(){
        return "string length should be not less then " + this.value();
    }
}
/**
 * max properties constraint
 */
export class MaxProperties extends  MinMaxRestriction{
    constructor(val: number){
        super("maxProperties",val,true,"minProperties",ts.OBJECT,true);
    }


    extractValue(i:any):number {
        return Object.keys(i).length;
    }

    toString(){
        return "object should have not more then " + this.value()+" properties";
    }
}
/**
 * min properties constraint
 */
export class MinProperties extends  MinMaxRestriction{
    constructor(val: number){
        super("minProperties",val,false,"maxProperties",ts.OBJECT,true);
    }


    extractValue(i:any):number {
        return Object.keys(i).length;
    }

    toString(){
        return "object should have not less then " + this.value()+" properties";
    }
}
/**
 * unique items constraint
 */
export class UniqueItems extends FacetRestriction<boolean>{

    constructor(private _value:boolean){
        super();
    }
    facetName(){return "uniqueItems"}
    requiredType(){return ts.ARRAY}

    check(i:any):ts.Status{
        if (Array.isArray(i)){
            var r:any[]=i;
            if (_.unique(r).length!= r.length){
                return ts.error(this.toString(),this);
            }
        }
        return ts.OK_STATUS
    }


    composeWith(r:ts.Constraint):ts.Constraint{
        if (r instanceof UniqueItems){
            var mm:UniqueItems=r;
            if (mm._value==this._value){
                return this;
            }
        }
        return null;
    }

    value(){
        return this._value;
    }
    checkValue():string{
        return null;
    }
    toString(){
        return "items should be unique";
    }
}
/**
 * components of array should be of type
 */
export class ComponentShouldBeOfType extends FacetRestriction<ts.AbstractType>{
    facetName(){return "items"}
    requiredType(){return ts.ARRAY}

    constructor(private type:ts.AbstractType){
        super();
    }

    public toString() {
        return "items should be of type " + this.type;
    }
    check(i:any):ts.Status{

        var rs=new ts.Status(ts.Status.OK,0,"",this);
        if (Array.isArray(i)){
            var ar:any[]=i;
            for (var j=0;j<ar.length;j++){
                var ss=this.type.validate(ar[j],true);
                ss.setValidationPath({ name:""+j})
                rs.addSubStatus(ss);
            }
        }
        return rs;
    }
    validateSelf(registry:ts.TypeRegistry):ts.Status {
        if (this.type.isAnonymous()) {
            var st = this.type.validateType(registry);
            if (!st.isOk()) {
                return new Status(Status.ERROR, 0,  "component type has error:" + st.getMessage(),this)
            }
            return st;
        }
        if (this.type.isExternal()){
            var p= new Status(Status.ERROR,0,"It is not allowed to use external types in component type definitions",this)
            return p;
        }
        if (this.type.isSubTypeOf(ts.UNKNOWN) || this.type.isSubTypeOf(ts.RECURRENT)) {
            return new Status(Status.ERROR, 0, "component refers to unknown type " + this.type.name(),this)
        }
        if (this.type.isUnion()) {
            var ui = _.find(this.type.typeFamily(), x=>x.isSubTypeOf(ts.UNKNOWN));
            if (ui) {
                return new Status(Status.ERROR, 0, "component refers to unknown type " + ui.name(),this)
            }
        }
        return ts.OK_STATUS;
    }
    composeWith(t:ts.Constraint):ts.Constraint{
        if (t instanceof ComponentShouldBeOfType){
            var pi:ComponentShouldBeOfType=t;

                if (this.type.typeFamily().indexOf(pi.type)!=-1){
                    return pi;
                }
                if (pi.type.typeFamily().indexOf(this.type)!=-1){
                    return this;
                }
                var intersectionType = this.intersect(this.type, pi.type);
                try {
                    var is:ts.Status = intersectionType.checkConfluent();
                    if (!is.isOk()) {
                        var rc=<ts.RestrictionsConflict>is;
                        return rc.toRestriction();
                    }
                    return new ComponentShouldBeOfType( intersectionType);
                }finally {
                    this.release(intersectionType);
                }

        }
        return null;
    }
    checkValue():string{
        return null;
    }

    value(){
        return this.type;
    }


}
/**
 * regular expression (pattern) constraint
 */
export class Pattern extends FacetRestriction<string>{

    constructor(private _value:string){
        super();
    }
    facetName(){return "pattern"}
    requiredType(){return ts.STRING}

    check(i:any):ts.Status{
        if (typeof i=='string'){
            var st:string=i;
            try {
                var mm=st.match(this._value);
                if (!mm){
                    return new ts.Status(ts.Status.ERROR, 0, "string should match to " + this.value(),this);
                }
            }catch (e){

            }
        }
        return ts.OK_STATUS
    }


    composeWith(r:ts.Constraint):ts.Constraint{
        if (r instanceof Pattern){
            var v=<Pattern>r;
            if (v._value===this._value){
                return this;
            }
            return  this.nothing(r,"pattern restrictions can not be composed at one type");
        }
        return null;
    }

    value(){
        return this._value;
    }
    checkValue(){
        try{
            new RegExp(this._value);
        }
        catch (e){
            return e.message;
        }
        return null;
    }
    toString(){
        return "should pass reg exp:"+this.value;
    }
}
/**
 * enum constraint
 */
export class Enum extends FacetRestriction<string[]>{

    constructor(private _value:string[]){
        super();
        if (!Array.isArray(_value)){
            this._value=[<string><any>_value];
        }

    }
    facetName(){return "enum"}
    requiredType(){return ts.SCALAR}


    checkStatus:boolean
    check(i:any):ts.Status{
        if (!this.checkStatus) {
            if (!this.value().some(x=>x == i)) {
                return ts.error(this.toString(),this);
            }
        }
        return ts.OK_STATUS
    }


    composeWith(r:ts.Constraint):ts.Constraint{
        if (r instanceof Enum){
            var v=<Enum>r;
            var sss= _.intersection(this._value, v._value);
            if (sss.length==0){
                return this.nothing(r);
            }
            return new Enum(sss);
        }
        return null;
    }

    value(){
        return this._value;
    }
    checkValue(){
        if (!this.owner().isSubTypeOf(this.requiredType())){
            return "enum facet can only be used with: "+this.requiredType().name();

        }
        if (_.uniq(this._value).length<this._value.length){
            return "enum facet can only contain unique items";
        }
        var result:string=null;
        this.checkStatus=true;
        try {
            this._value.forEach(x=> {
                var res = this.owner().validate(x);
                if (!res.isOk()) {
                    result= res.getMessage();
                }
            })
        }finally {
            this.checkStatus=false;
        }
        return result;
    }
    toString(){
        return "value should be one of:" + this._value;
    }
}
/**
 * this function attempts to optimize to set of restrictions
 * @param r
 * @returns {ts.Constraint[]}
 */
export function optimize(r:ts.Constraint[]){
    r= r.map(x=>x.preoptimize());
    var optimized:ts.Constraint[]=[];
    r.forEach(x=>{
        if (x instanceof  AndRestriction){
            var ar:AndRestriction=x;
            ar.options().forEach(y=>{optimized.push(y)})
        }
        else{
            optimized.push(x);
        }
    })
    var transformed=true;
    while (transformed){
        transformed=false;
        for (var i=0;i<optimized.length;i++){
            for (var j=0;j<optimized.length;j++){
                var rs0=optimized[i];
                var rs1=optimized[j];
                if (rs0!==rs1){
                    var compose=rs0.tryCompose(rs1);
                    if (compose) {
                        var newOptimized = optimized.filter(x=>x !== rs0 && x !== rs1);
                        newOptimized.push(compose);
                        transformed = true;
                        optimized = newOptimized;
                        break;
                    }
                }
            }
            if (transformed){
                break;
            }
        }
    }
    return optimized;
}