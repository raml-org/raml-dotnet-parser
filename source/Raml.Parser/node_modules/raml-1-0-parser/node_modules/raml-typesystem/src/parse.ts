import  ts=require("./typesystem")
import  rs=require("./restrictions")
import {AbstractType} from "./typesystem";
import typeExpressions=require("./typeExpressions")
import facetR=require("./facetRegistry")
import meta=require("./metainfo")
import {Annotation} from "./metainfo";
import {Type} from "typescript";
import {FacetDeclaration} from "./metainfo";
import {HasProperty} from "./restrictions";
import {AdditionalPropertyIs} from "./restrictions";
import {MapPropertyIs} from "./restrictions";
import {TypeRegistry} from "./typesystem";
import {ComponentShouldBeOfType} from "./restrictions";

import su = require('./schemaUtil');
import {KnownPropertyRestriction} from "./restrictions";

export enum NodeKind{
    SCALAR,
    ARRAY,
    MAP
}

export interface ParseNode {

    key():string

    value():any

    children():ParseNode[];

    childWithKey(k:string):ParseNode;

    kind(): NodeKind
}

class JSObjectNode implements ParseNode{

    constructor(private _key:string,private obj:any,private inArr:boolean=false, private provider: su.IContentProvider){
    }

    value(){
        return this.obj;
    }

    key(){
        if (!this._key){
            if (this.kind()===NodeKind.MAP&&this.inArr){
                var l=Object.keys(this.obj);
                if (l.length===1){
                    return l[0];
                }
            }
        }
        return this._key;
    }
    childWithKey(k:string):ParseNode{
        if (this.obj==null){
            return null;
        }
        if (this.obj.hasOwnProperty(k)){
            return new JSObjectNode(k,this.obj[k], false, this.contentProvider());
        }
        return null;
    }

    children():JSObjectNode[]{
        if (Array.isArray(this.obj)){
            return (<any[]>this.obj).map(x=>new JSObjectNode(null,x,true, this.contentProvider()));
        }
        else if (this.obj&&typeof this.obj=="object"){
            return Object.keys(this.obj).map(x=>new JSObjectNode(x,this.obj[x], false, this.provider));
        }
        return []
    }
    kind():NodeKind{
        if (!this.obj){
            return NodeKind.SCALAR;
        }
        if (Array.isArray(this.obj)){
            return NodeKind.ARRAY;
        }
        else if (typeof this.obj==="object"){
            return NodeKind.MAP;
        }
        return NodeKind.SCALAR;
    }

    contentProvider(): su.IContentProvider {
        return this.provider;
    };
}
export function parseJSON(name: string,n:any,r:ts.TypeRegistry=ts.builtInRegistry(), provider?: su.IContentProvider):ts.AbstractType {
    return parse(name,new JSObjectNode(null,n, false, provider),r);
}
export function parseJSONTypeCollection(n:any,r:ts.TypeRegistry=ts.builtInRegistry(), provider?: su.IContentProvider):TypeCollection {
    return parseTypeCollection(new JSObjectNode(null,n, false, provider),r);
}
function isOptional(p:string) {
    return p.charAt(p.length - 1) == '?';
}

export class PropertyBean{
    id: string
    optional: boolean
    additonal: boolean
    regExp: boolean;
    type: ts.AbstractType;

    add(t:ts.AbstractType){
        if (!this.optional&&!this.additonal&&!this.regExp){
            t.addMeta(new rs.HasProperty(this.id));
        }
        if (this.additonal){
            t.addMeta(new rs.AdditionalPropertyIs(this.type));
        }
        else if (this.regExp){
            t.addMeta(new rs.MapPropertyIs(this.id,this.type));
        }
        else{
            t.addMeta(new rs.PropertyIs(this.id,this.type));
        }
    }
}
export class TypeCollection {
    private _types:AbstractType[]=[];
    private _typeMap:{[name:string]:AbstractType}={};
    private uses:{ [name: string]: TypeCollection }={}

    private _annotationTypes:AbstractType[]=[];
    private _annotationTypeMap:{[name:string]:AbstractType}={};


    library(n:string){
        return this.uses[n];
    }

    addLibrary(n:string,t: TypeCollection){
        this.uses[n]=t;
    }


    add(t:AbstractType){
        this._types.push(t);
        this._typeMap[t.name()]=t;
    }

    getType(name:string){
        if (this._typeMap.hasOwnProperty(name)) {
            return this._typeMap[name];
        }
        return null;
    }

    addAnnotationType(t:AbstractType){
        this._annotationTypes.push(t);
        this._annotationTypeMap[t.name()]=t;
    }

    getAnnotationType(name:string){
        if (this._annotationTypeMap.hasOwnProperty(name)) {
            return this._annotationTypeMap[name];
        }
        return null;
    }

    types(){
        return this._types;
    }
    annotationTypes(){
        return this._annotationTypes;
    }

    getAnnotationTypeRegistry():TypeRegistry{
        var r=new TypeRegistry(ts.builtInRegistry());
        this.annotationTypes().forEach(x=>r.addType(x));
        Object.keys(this.uses).forEach(x=>{
            this.uses[x].annotationTypes().forEach(y=>r.put(x+"."+ y.name(),y));
        })
        return r;
    }
    getTypeRegistry():TypeRegistry{
        var r=new TypeRegistry(ts.builtInRegistry());
        this.types().forEach(x=>r.addType(x));

        Object.keys(this.uses).forEach(x=>{
            this.uses[x].types().forEach(y=>r.put(x+"."+ y.name(),y));
        })
        return r;
    }
}

export class AccumulatingRegistry extends ts.TypeRegistry{


    constructor(private toParse:ParseNode,private schemas:ParseNode,ts:ts.TypeRegistry,private _c:TypeCollection){
        super(ts)
    }


    parsing:{ [name:string]:boolean}={};

    get(name: string ):ts.AbstractType{
        var result=super.get(name);

        if (!result){

            var chld=this.toParse?this.toParse.childWithKey(name):null;
            if (!chld){
                chld=this.schemas?this.schemas.childWithKey(name):null;
            }
            if (chld){
                if (this.parsing[name]){
                    return ts.derive(name,[ts.RECURRENT]);
                }
                this.parsing[name]=true;
                try {
                    var tp = parse(name, chld, this);
                }
                finally {
                    delete this.parsing[name];
                }
                return tp;
            }
            else{
                var dt=name.indexOf('.');
                if (dt!=-1){
                    var ln=name.substring(0,dt);
                    var tn=name.substr(dt+1);
                    var lib=this._c.library(ln);
                    if (lib){
                        var t=lib.getType(tn);
                        if (t){
                            return t;
                        }
                    }
                }
            }
        }
        return result;
    }
}

export function parseTypes(n:any,tr:ts.TypeRegistry=ts.builtInRegistry()):TypeCollection{
    var provider: su.IContentProvider = n.provider && n.provider();

    return parseTypeCollection(new JSObjectNode(null,n, false, provider),tr);
}

class WrapArrayNode implements ParseNode{
    constructor(private n:ParseNode){


    }
    key():string{
        return null
    }

    value():any{
        return null;
    }
    childWithKey(k:string):ParseNode{
        var r=this.children();
        for (var i=0;i< r.length;i++){
            if (r[i].key()==k){
                return r[i];
            }
        }
        return null;
    }

    children():ParseNode[]{
        return this.n.children().map(x=>{
            var c=x.children();
            if (c.length==1){
                return c[0];
            }
            return x;
        });
    }


    kind():NodeKind{
        return NodeKind.MAP;
    }
}

function  transformToArray(n:ParseNode):ParseNode{
    return new WrapArrayNode(n);
}

export function parseTypeCollection(n:ParseNode,tr:ts.TypeRegistry):TypeCollection{
    var result=new TypeCollection();
    var uses=n.childWithKey("uses");
    if (uses&&uses.kind()===NodeKind.ARRAY){
        uses=transformToArray(uses);
    }
    if (uses&&uses.kind()===NodeKind.MAP){
        uses.children().forEach(c=>{
            result.addLibrary(c.key(),parseTypeCollection(c,tr));
        })
    }3

    var tpes=n.childWithKey("types");
    if (tpes&&tpes.kind()===NodeKind.ARRAY){
        tpes=transformToArray(tpes);
    }

    var schemas=n.childWithKey("schemas");
    if (schemas&&schemas.kind()===NodeKind.ARRAY){
        schemas=transformToArray(schemas);
    }

    var reg=new AccumulatingRegistry(tpes,schemas,tr,result);
    if (tpes&&tpes.kind()!==NodeKind.SCALAR){
        tpes.children().forEach(x=>{
            reg.get(x.key());
        });
    }
    if (schemas&&schemas.kind()!==NodeKind.SCALAR){
        schemas.children().forEach(x=>{

            reg.get(x.key());
        });
    }
    reg.types().forEach(x=>result.add(x));
    var tpes=n.childWithKey("annotationTypes");
    if (tpes&&tpes.kind()===NodeKind.ARRAY){
        tpes=transformToArray(tpes);
    }
    if (tpes!=null&&tpes.kind()===NodeKind.MAP){
        tpes.children().forEach(x=>{
           result.addAnnotationType(parse(x.key(),x,reg,false,true))
        });
    }
    
    return result;
}

export function parsePropertyBean(n:ParseNode,tr:ts.TypeRegistry):PropertyBean{
    var result=new PropertyBean();
    var name:string= n.key();
    if (isOptional(n.key())){
        name=name.substr(0,name.length-1);
        result.optional=true;
    }
    if (name==='[]'||name.length==0||name==='//'){
        result.additonal=true;

    }
    else if (name.charAt(0)=='['&&name.charAt(name.length-1)==']'){
        name=name.substring(1,name.length-1);
        result.regExp=true;
    }
    else if (name.charAt(0)=='/'&&name.charAt(name.length-1)=='/'){
        name=name.substring(1,name.length-1);
        result.regExp=true;
    }
    result.type=parse(null, n,tr);
    result.id=name;
    var rs=n.childWithKey("required");
    if (rs){
        if (rs.value()==false){
            result.optional=true;
            result.id=n.key();
        }
    }
    return result;
}

export class TypeProto{
    name: string

    properties:PropertyBean[];

    basicFacets: ts.TypeInformation[];

    facetDeclarations: meta.FacetDeclaration[]

    annotations: Annotation[]

    customFacets: meta.CustomFacet[]

    notAScalar:boolean

    superTypes: string[]

    toJSON(){
        var result:{ [name:string]:any}={};
        if (this.superTypes&&this.superTypes.length>0){
            if (this.superTypes.length==1){
                result['type']=this.superTypes[0];
            }
            else{
                result['type']=this.superTypes;
            }
        }
        if (this.customFacets){
            this.customFacets.forEach(x=>result[x.facetName()]= x.value());
        }
        if (this.annotations){
            this.annotations.forEach(x=>result["("+x.facetName()+")"]= x.value());
        }

        if (this.facetDeclarations&&this.facetDeclarations.length>0){
            var facets:{ [name:string]:any}={};
            this.facetDeclarations.forEach(x=>{
                var nm= x.facetName();
                if (x.isOptional()){
                    nm=nm+"?";
                }
                var vl:any=null;
                if (x.type().isAnonymous()){
                    if (x.type().isEmpty()) {
                        vl = typeToSignature(x.type());
                    }
                    else{
                        vl=toProto(x.type()).toJSON();
                    }
                }
                else{
                    vl=typeToSignature(x.type());
                }
                facets[nm]=vl;
            });
            result['facets']=facets;
        }
        if (this.properties&&this.properties.length>0){
            var properties:{ [name:string]:any}={};
            this.properties.forEach(x=>{
                var nm= x.id;
                if (x.optional){
                    nm=nm+"?";
                }
                if (x.additonal){
                    nm="[]"
                }
                if (x.regExp){
                    nm="["+nm+"]";
                }
                var vl:any=null;
                if (x.type.isAnonymous()){
                    if (x.type.isEmpty()) {
                        vl = typeToSignature(x.type);
                    }
                    else{
                        vl=toProto(x.type).toJSON();
                    }
                }
                else{
                    vl=typeToSignature(x.type);
                }
                properties[nm]=vl;
            });
            result['properties']=properties;
        }
        if (this.basicFacets) {
            this.basicFacets.forEach(x=> {
                result[x.facetName()] = x.value();
            })
        }
        if (Object.keys(result).length==1&&!this.notAScalar){
            if (result['type']){
                return result['type'];
            }
        }

        return result;
    }
}

export function toProto(type:AbstractType):TypeProto{
    var result:TypeProto=new TypeProto();
    result.name=type.name();
    result.superTypes=type.superTypes().map(x=>typeToSignature(x));
    result.annotations=[];
    result.customFacets=[];
    result.facetDeclarations=[];
    result.basicFacets=[];
    result.properties=[];
    var pmap:{[name:string]:PropertyBean}={}
    type.declaredMeta().forEach(x=>{
        if (x instanceof meta.Annotation){
            result.annotations.push(x);
        }
        else if (x instanceof meta.CustomFacet){
            result.customFacets.push(x);
        }else if (x instanceof meta.NotScalar){
            result.notAScalar=true;
        }
        else if (x instanceof FacetDeclaration){
            result.facetDeclarations.push(x);
        }
        else{
            if (x instanceof rs.HasProperty){
                if (pmap.hasOwnProperty(x.value())){
                    pmap[x.value()].optional=false;
                }
                else{
                    var pbean=new PropertyBean();
                    pbean.optional=false;
                    pbean.id= x.value();
                    pbean.type=ts.ANY;
                    pmap[x.value()]=pbean;
                }
            }
            else if (x instanceof rs.AdditionalPropertyIs){

                var pbean=new PropertyBean();
                pbean.optional=false;
                pbean.id= "[]";
                pbean.additonal=true;
                pbean.type= x.value();
                pmap['[]']=pbean;
            }
            else if (x instanceof rs.MapPropertyIs){
                var pbean=new PropertyBean();
                pbean.optional=false;
                pbean.id= x.regexpValue();
                pbean.regExp=true;
                pbean.type= x.value();
                pmap[x.regexpValue()]=pbean;
            }
            else if (x instanceof rs.PropertyIs){
                if (pmap.hasOwnProperty(x.propertyName())){
                    pmap[x.propertyName()].type= x.value();
                }
                else{
                    var pbean=new PropertyBean();
                    pbean.optional=true;
                    pbean.id= x.propertyName();
                    pbean.type= x.value();
                    pmap[x.propertyName()]=pbean;
                }
            }
            else{

                if (!(x instanceof rs.KnownPropertyRestriction)) {
                    result.basicFacets.push(x);
                }
             }
        }
    })
    Object.keys(pmap).forEach(x=>result.properties.push(pmap[x]));
    return result;
}

/***
 * stores a type to JSON structure
 * @param ts
 */
export function storeAsJSON(ts:AbstractType|TypeCollection) : any{
   if (ts instanceof AbstractType) {
       return toProto(ts).toJSON();
   }
    else{
       return storeTypeCollection(<TypeCollection>ts);
   }
}
function storeTypeCollection(tc:TypeCollection):any{
    var res:any={};
    var types:any={};
    tc.types().forEach(x=>{
        types[x.name()]=storeAsJSON(x);
    })
    if (Object.keys(types).length>0) {
        res["types"] = types;
    }
    var types:any={};
    tc.annotationTypes().forEach(x=>{
        types[x.name()]=storeAsJSON(x);
    })
    if (Object.keys(types).length>0) {
        res["annotationTypes"] = types;
    }
    return res;
}

function typeToSignature(t:ts.AbstractType):string{
    if (t.isAnonymous()){
        if (t.isArray()){
            var ci=t.oneMeta(rs.ComponentShouldBeOfType);
            if (ci){
                var vl=ci.value();
                if (vl.isAnonymous()&&vl.isUnion()){
                    return "("+typeToSignature(vl)+")"+"[]";
                }
                return typeToSignature(vl)+"[]";
            }
        }
        if (t.isUnion()){
            return (<ts.UnionType>t).options().map(x=>typeToSignature(x)).join(" | ");
        }
        return t.superTypes().map(x=>typeToSignature(x)).join(" , ");
    }
    return t.name();
}

/**
 * parses a type from a JSON structure
 * @param name
 * @param n
 * @param r
 * @returns {any}
 */
export function parse(name: string,n:ParseNode,r:ts.TypeRegistry=ts.builtInRegistry(),defaultsToAny:boolean=false,annotation:boolean=false):ts.AbstractType{
    //Build super types.

    var provider: su.IContentProvider = (<any>n).contentProvider ? (<any>n).contentProvider() : null;

    if (n.kind()==NodeKind.SCALAR){
        var sp= n.value()?typeExpressions.parseToType(""+n.value(),r, provider):ts.STRING;
        if (name==null){
            return sp;
        }
        var res=ts.derive(name,[sp]);
        if (r instanceof AccumulatingRegistry){
            r.addType(res);

            res.putExtra("topLevel",true);
        }
        return res;
    }
    if (n.kind()==NodeKind.ARRAY){
        var supers:ts.AbstractType[]=[];
        n.children().forEach(x=>{
            supers.push(typeExpressions.parseToType(""+x.value(),r, provider))
        })
        var res=ts.derive(name,supers);
        if (r instanceof AccumulatingRegistry){
            r.addType(res);
            res.putExtra("topLevel",true);
        }
        return res;
    }
    var superTypes:AbstractType[]=[];
    var tp=n.childWithKey("type");
    var shAndType:boolean=false;
    if (!tp){
        tp=n.childWithKey("schema");
    }
    else{
        if (n.childWithKey("schema")){
            shAndType=true;
        }
    }
    if (!tp){
        if (defaultsToAny){
            if (n.childWithKey("properties")) {
                superTypes = [ts.OBJECT];
                }
            else {
                superTypes = [ts.ANY];
            }
        }
        else {
            if (n.childWithKey("properties")) {
                superTypes = [ts.OBJECT];
            }
            else {
                superTypes = [ts.STRING];
            }
        }
    }
    else{
        if (tp.kind()==NodeKind.SCALAR){
            superTypes=[typeExpressions.parseToType(""+tp.value(),r, provider)];
        }
        else if (tp.kind()==NodeKind.ARRAY){
            superTypes=tp.children().map(x=>x.value()).map(y=>typeExpressions.parseToType(""+y,r, provider));
        }
    }
    var result=ts.derive(name,superTypes);


    var actualResult=result;
    var repeat= n.childWithKey("repeat");
    if (repeat&&repeat.value()==true){
        actualResult=ts.derive(name,[ts.ARRAY]);
        actualResult.addMeta(new ComponentShouldBeOfType(result));
    }
    if (r instanceof AccumulatingRegistry){
        r.addType(actualResult);
        actualResult.putExtra("topLevel",true);
    }
    n.children().forEach(x=>{
        var key = x.key();
        if (!key){
            return;
        }
        if (key==="type"){
            return;
        }
        if (key==="repeat"){
            return;
        }
        if (key==="schema"){
            return;
        }
        if (key=="properties"||key=="additionalProperties"||key=="patternProperties"){
            if (result.isSubTypeOf(ts.OBJECT)){
                return;
            }
        }
        if (key=="items"){
            if (result.isSubTypeOf(ts.ARRAY)){
                var tp=parse(null, x,r);
                actualResult.addMeta(new ComponentShouldBeOfType(tp));
                return;
            }
        }

        if (key==="facets"){
            return;
        }
        if (key.charAt(0)=='('&& key.charAt(key.length-1)==')'){
            result.addMeta(new meta.Annotation(key.substr(1, key.length-2), x.value()));
            return;
        }
        var vl=facetR.getInstance().buildFacet(key, x.value());
        if (vl&&result.isSubTypeOf(vl.requiredType())){
            result.addMeta(vl);
        }
        else{
            if (annotation&&key==="allowedTargets"){
                result.addMeta(new meta.AllowedTargets(x.value()));
            }
            else {
                result.addMeta(new meta.CustomFacet(key, x.value()));
            }
        }
    });
    if (result.isSubTypeOf(ts.OBJECT)) {
        var props=n.childWithKey("properties");
        var hasProps=false;
        if (props) {
            if (props.kind() == NodeKind.MAP) {
                props.children().forEach(x=> {
                    hasProps = true;
                    parsePropertyBean(x, r).add(result);
                });
            }
        }
        var ap= n.childWithKey("additionalProperties");
        if (ap){
            result.addMeta(new KnownPropertyRestriction(ap.value()));
        }
        var props=n.childWithKey("patternProperties");
        if (props) {
            if (props.kind() == NodeKind.MAP) {
                props.children().forEach(x=> {
                    var pb=parsePropertyBean(x, r);
                    result.declareMapProperty(pb.id,pb.type);
                });
            }
        }
    }

    var props=n.childWithKey("facets");
    if (props){
        if (props.kind()==NodeKind.MAP){
            props.children().forEach(x=>{
                var bean=parsePropertyBean(x,r);
                result.addMeta(new meta.FacetDeclaration(bean.id,bean.type,bean.optional));
            });
        }
    }
    if (result.isAnonymous()&&result.isEmpty()){
        if (result.superTypes().length==1){
            return result.superTypes()[0];
        }
    }
    if (n.kind()!=NodeKind.SCALAR){
        result.addMeta(new meta.NotScalar());
    }
    if (shAndType){
        actualResult.putExtra(ts.SCHEMA_AND_TYPE,true);
    }
    return actualResult;
}