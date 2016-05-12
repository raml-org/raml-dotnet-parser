/// <reference path="../typings/main.d.ts" />
import tsModel=require("ts-structure-parser")
import def=require("./definitionSystem")
import _=require("underscore")
import aHandlers=require("./annotationHandlers")
var services=def
class FieldWrapper{

    constructor(private _field:tsModel.FieldModel,private _clazz:ClassWrapper){

    }

    name(){
        return this._field.name;
    }
    range():ClassWrapper{

        return this._clazz.getModule().typeFor(this._field.type,this._clazz);
    }

    isMultiValue(){
        return this._field.type.typeKind==tsModel.TypeKind.ARRAY
    }

    isKey(){
        return _.find(this._field.annotations,x=>x.name=="MetaModel.key")!=null;
    }
    isSimpleValue(){
        return _.find(this._field.annotations,x=>x.name=="MetaModel.value")!=null;
    }

    annotations(){
        return this._field.annotations;
    }
}

interface TypeWrapper{
    name()
    methods():tsModel.MethodModel[]
    members():FieldWrapper[]
    isSubTypeOf(of:TypeWrapper):boolean
    getSuperTypes():TypeWrapper[]
    constraints():FieldConstraint[]
    getAllSuperTypes():TypeWrapper[]
    typeMeta():tsModel.Annotation[]
    getModule():ModuleWrapper;
    annotationOverridings():{[key:string]:tsModel.Annotation[]};
}
class FieldConstraint{

    constructor(private _field:tsModel.FieldModel,private _clazz:ClassWrapper){

    }

    name(){
        return this._field.name;
    }

    value(){
        return this._field.valueConstraint
    }

}
class ClassWrapper implements TypeWrapper{
    constructor(private _clazz:tsModel.ClassModel,private mw:ModuleWrapper){

    }

    typeMeta():tsModel.Annotation[]{
        return this._clazz.annotations;
    }
    path(){
        return this.mw.path();
    }

    getModule(){
        return this.mw;
    }
    typeArgs():string[]{
        return this._clazz.typeParameters
    }

    typConstraints():TypeWrapper[]{
        return this._clazz.typeParameterConstraint.map(x=>{
            if (x){
            return this.mw.classForName(x)
            }
            return null;
        })
    }

    methods(){
        return this._clazz.methods;
    }
    name(){
        return this._clazz.name;
    }
    members():FieldWrapper[]{
        return this._clazz.fields.filter(x=>x.valueConstraint==null).map(x=>new FieldWrapper(x,this))
    }

    constraints():FieldConstraint[]{
        return this._clazz.fields.filter(x=>x.valueConstraint!=null).map(x=>new FieldConstraint(x,this))

    }

    isSubTypeOf(of:TypeWrapper):boolean{
        if (this==of){
            return true;
        }
        var _res=false;
        this.getAllSuperTypes().forEach(x=>{
            if (!_res){
            _res=_res||x.isSubTypeOf(of)
            }
        })
        return _res;
    }

    getExtendsClauses(){
        return this._clazz.extends
    }

    getSuperTypes():TypeWrapper[]{
        var result:TypeWrapper[]=[];
        this._clazz.extends.forEach(x=>{
            var tp=this.mw.classForName((<tsModel.BasicType>x).typeName);
            if (tp){
                result.push(tp);
            }
        });
        return result;
    }
    getAllSuperTypes():TypeWrapper[]{
        var result:TypeWrapper[]=[];
        this._clazz.extends.forEach(x=>{

            var tp=this.mw.classForName((<tsModel.BasicType>x).typeName);
            if (tp){
                var mm=tp.getAllSuperTypes();
                result.push(tp);
                result.concat(mm)
            }
        });
        return _.unique(result);
    }

    annotationOverridings():{[key:string]:tsModel.Annotation[]}{ return this._clazz.annotationOverridings; }
}
class AbstractSimpleWrapper implements TypeWrapper{
    members():FieldWrapper[]{
        return [];//this._clazz.members.map(x=>new FieldWrapper(x,this))
    }
    methods(){return []}

    isSubTypeOf(of:ClassWrapper):boolean{
        return false;
    }

    getSuperTypes():TypeWrapper[]{
        return [];
    }
    getAllSuperTypes():TypeWrapper[]{
        return [];
    }
    name():string{
        return null;
    }
    constraints():FieldConstraint[]{
        return []
    }
    typeMeta(){
        return [];
    }
    getModule():ModuleWrapper{
        throw new Error("Not implemented")
    }

    annotationOverridings():{[key:string]:tsModel.Annotation[]}{ return {}; }
}
class EnumWrapper extends AbstractSimpleWrapper{


    constructor (private _clazz:tsModel.EnumDeclaration,private mw:ModuleWrapper){
        super()
    }

    getModule(){
        return this.mw;
    }

    values(){
        return this._clazz.members;
    }

    name(){
        return this._clazz.name;
    }

}
class UnionWrapper extends AbstractSimpleWrapper{

    constructor (private _clazz:TypeWrapper[],private mw:ModuleWrapper){
        super();
    }
    elements(){
        return this._clazz;
    }

    name(){
        return this._clazz.map(x=>x.name()).join("|")
    }
}



class ModuleWrapper{

    name2Class:{ [name:string]:TypeWrapper}={}
    namespaceToMod:{[name:string]:ModuleWrapper}={}
    private _classes:TypeWrapper[]=[]

    typeFor(t:tsModel.TypeModel,ow:ClassWrapper){
        switch (t.typeKind){
            case tsModel.TypeKind.BASIC:
                var bt=<tsModel.BasicType>t;
                var typeName=bt.typeName
                if (typeName=="string"){
                    typeName="StringType";
                }
                if (typeName=="number"){
                    typeName="NumberType";
                }
                if (typeName=="boolean"){
                    typeName="BooleanType";
                }
                if (typeName=="any"){
                    typeName="AnyType";
                }

                var ti=_.indexOf(ow.typeArgs(),typeName)
                if (ti!=-1){
                    var cnst=ow.typConstraints()[ti];
                    if (!cnst){
                        return this.classForName("ValueType")
                    }
                    return cnst;
                }
                return this.classForName(typeName);
            case tsModel.TypeKind.UNION:

                var ut=<tsModel.UnionType>t;

                return new UnionWrapper(ut.options.map(x=>this.typeFor(x,ow)),this);
            case tsModel.TypeKind.ARRAY:
                var at=<tsModel.ArrayType>t;
                return this.typeFor(at.base,ow);
        }
        return null;
    }
    path(){
        return this._univers.name;
    }
    constructor(private _univers:tsModel.Module){
        _univers.classes.forEach(x=>{
            var c=new ClassWrapper(x,this);
            this._classes.push(c)
            this.name2Class[x.name]=c;
            if(x.moduleName){
                //FIXME
                this.name2Class[x.moduleName+"."+x.name]=c;
            }
        })
        _univers.enumDeclarations.forEach(x=>{
            var c=new EnumWrapper(x,this);
            this._classes.push(c)
            this.name2Class[x.name]=c;

        })
    }
    classForName(name:string,stack:{[name:string]:ModuleWrapper}={}){
        if (!name){
            return null;
        }
        var result=this.name2Class[name];

        if (!result&&!stack[this.path()]){
            stack[this.path()]=this;
            var nmsp=name.indexOf(".");
            if (nmsp!=-1){
                var actualMod=this.namespaceToMod[name.substring(0,nmsp)];
                if(!actualMod){
                    throw new Error();
                }
                return actualMod.classForName(name.substring(nmsp+1),stack)
            }
            Object.keys(this.namespaceToMod).forEach(x=>{
               if (x!="MetaModel") {
                   var nm = this.namespaceToMod[x].classForName(name,stack);
                   if (nm) {
                       result = nm;
                   }
               }
            })
        }
        return result;
    }

    classes(){
        return this._classes;
    }
}

var wrapperToType = function (range:TypeWrapper, u:def.Universe) {
    if (range) {
        var rangeType:def.IType;
        if (range instanceof UnionWrapper) {
            var uw = <UnionWrapper>range;
            throw new Error("Union type support was removed from definition system")
            //rangeType = new def.UnionType(uw.elements().map(x=>wrapperToType(x, u)))
        }
        else {
            rangeType = u.type(range.name())
        }
        return rangeType;
    }
    else{
        return ;
    }
};
var registerClasses = function (m:ModuleWrapper, u:def.Universe) {
    var valueType = m.classForName("ValueType");
    m.classes().forEach(x=> {

        if (x instanceof EnumWrapper) {
            var et = new def.EnumType(x.name(), u, x.getModule().path());
            et.values = (<EnumWrapper>x).values()
            u.register(et);
            return;
        }
        if (x.isSubTypeOf(valueType)) {
            var st = x.getAllSuperTypes();
            st.push(x);
            var refTo = null;
            st.forEach(t=> {

                var cs = (<ClassWrapper>t).getExtendsClauses();
                cs.forEach(z=> {
                    if (z.typeKind == tsModel.TypeKind.BASIC) {
                        var bas = <tsModel.BasicType>z;
                        if (bas.basicName == 'Reference') {
                            var of = bas.typeArguments[0];
                            refTo = (<tsModel.BasicType>of).typeName;
                        }

                    }
                })

            })
            if (refTo) {
                //console.log("New reference type" + x.name())
                var ref = new def.ReferenceType(x.name(), x.getModule().path(), refTo, u);
                u.register(ref)
            }
            else {
                var vt = new def.ValueType(x.name(), u, x.getModule().path());
                u.register(vt);
            }
        }
        else {
            var gt = new def.NodeClass(x.name(), u, x.getModule().path());
            u.register(gt);
        }
    })
};

var registerHierarchy = function (m:ModuleWrapper, u:def.Universe) {
    m.classes().forEach(x=> {
        x.getSuperTypes().forEach(y=> {
            var tp0 = u.type(x.name())
            var tp1 = u.type(y.name())
            if (!tp0 || !tp1) {
                var tp0 = u.type(x.name())
                var tp1 = u.type(y.name())
                throw new Error();
            }
            u.registerSuperClass(tp0, tp1);
        })
    })
};

var registerEverything = function (m:ModuleWrapper, u:def.Universe) {

    m.classes().forEach(x=> {

        var tp = u.type(x.name())
        x.typeMeta().forEach(a=> {
            var rangeType = <def.NodeClass>wrapperToType(x, u);
            aHandlers.handleTypeAnnotation(a,rangeType);
        });
        x.members().forEach(x=> {

            var range = x.range();
            var rangeType = wrapperToType(range, u);
            if (rangeType == null) {
                console.log(range + ":" + x.name())
            }
            var custom = x.annotations().map(y=>y.name).indexOf('MetaModel.customHandling')>=0;
            createProp(x, <def.NodeClass>tp, rangeType,custom);
        });
        Object.keys(x.annotationOverridings()).forEach(fName=>{

            var arr = [].concat(x.annotationOverridings()[fName]);
            var map = {};
            arr.forEach(ann=>map[ann.name]=true);

            var targetField:FieldWrapper;
            var stArr = x.getSuperTypes();
            var stMap = {};
            for(var i = 0 ; i < stArr.length ; i++){
                var st = stArr[i];
                if(stMap[st.name()]){
                    continue;
                }
                stMap[st.name()] = true;
                st.getSuperTypes().forEach(sst=>stArr.push(sst));

                var arr1 = st.annotationOverridings()[fName];
                if(arr1){
                    arr1.filter(ann=>!map[ann.name]).forEach(ann=>{
                        map[ann.name]=true;
                        arr.push(ann);
                    });
                }
                else {
                    var stFields = st.members();
                    for (var j = 0; j < stFields.length; j++) {
                        var stField = stFields[j];
                        if (stField.name() == fName) {
                            targetField = stField;
                            break;
                        }
                    }
                }
                if(targetField){
                    var arr2 = targetField.annotations();
                    arr2.filter(ann=>!map[ann.name]).forEach(ann=>{
                        map[ann.name]=true;
                        arr.push(ann);
                    });
                    break;
                }
            }
            if(!targetField){
                return;
            }

            var range = targetField.range();
            var rangeType = wrapperToType(range, u);
            if (rangeType == null) {
                console.log(range + ":" + x.name())
            }
            createProp(targetField, <def.NodeClass>tp, rangeType,false,arr)

        });
        x.methods().forEach(x=> {
            var at = <def.AbstractType><any>tp;
            //at.addMethod(x.name, x.text);
            //console.log(x.name);
            //createMember(x, <def.AbstractType>tp, rangeType)
        });
        x.constraints().forEach(x=> {
            if (x.value().isCallConstraint) {
                throw new Error();
            }
            var mm:tsModel.ValueConstraint = <tsModel.ValueConstraint>x.value();
            (<def.NodeClass>tp).addRequirement(x.name(), "" + mm.value)
        })
    })
    u.types().forEach(x=> {
        var at=x;
        at.getAdapter(services.RAMLService).getAliases().forEach(y=>u.registerAlias(y,<def.IType><any>at));

    })
};
var processModule = function (ts:tsModel.Module, u:def.Universe,used:{ [nm:string]:ModuleWrapper},declared:{ [nm:string]:ModuleWrapper}):ModuleWrapper {
    if (ts.name.indexOf("metamodel.ts")!=-1){
        return;//FIXME
    }
    if (declared[ts.name]){
        return declared[ts.name]
    }
    var m = new ModuleWrapper(ts);
    used[ts.name]=m;
    declared[ts.name]=m;
    Object.keys(ts.imports).forEach(x=> {
        var pMod = ts.imports[x];
        if (used[pMod.name]){
            m.namespaceToMod[x]=used[pMod.name];
           return
           // throw new Error("Module "+pMod.name+" is part of the cycle "+ts.name+" on stack "+Object.keys(used).join(","))
        }

        var vMod=processModule(pMod,u,used,declared)
        m.namespaceToMod[x]=vMod;
    })
    used[ts.name]=null;
    return m;
};
export function toDefSystem(ts:tsModel.Module,q:any):def.Universe{
    var u=new def.Universe(q,"");
    var c:{[name:string]:ModuleWrapper}={}
    processModule(ts, u,{},c);

    Object.keys(c).forEach(x=>{
        registerClasses(c[x], u);
    })
    Object.keys(c).forEach(x=>{
        registerHierarchy(c[x],u);
    })
    Object.keys(c).forEach(x=>{
        registerEverything(c[x],u);
    })
    u.types().forEach(x=>{
        if (x instanceof def.NodeClass){
            var cl=<def.NodeClass>x;
            cl.properties().forEach(y=>{
                var t=y.range();
                var ap=<def.Property>y;
                if (!t.hasValueTypeInHierarchy()){
                    t.properties().forEach(p0=>{
                        if (p0.getAdapter(services.RAMLPropertyService).isKey()){
                            var kp=p0.keyPrefix();
                            if (kp) {
                                ap.withKeyRestriction(kp);
                                ap.merge()
                            }
                            var eo=p0.enumOptions();
                            if (eo) {
                                ap.withEnumOptions(eo)
                                ap.merge()
                            }
                        }
                    })
                }

            })
            if (cl.getAdapter(services.RAMLService).isGlobalDeclaration()){
                if (cl.getAdapter(services.RAMLService).getActuallyExports()&&cl.getAdapter(services.RAMLService).getActuallyExports()!="$self"){
                    var tp=cl.property(cl.getAdapter(services.RAMLService).getActuallyExports()).range();
                    if (tp.hasValueTypeInHierarchy()){
                        var vt=tp.getAdapter(services.RAMLService);
                        vt.setGloballyDeclaredBy(cl);
                    }
                    //rs+=genRef(tp)
                }
                if (cl.getAdapter(services.RAMLService).getConvertsToGlobal()){
                    var tp=<def.IType>u.type(cl.getAdapter(services.RAMLService).getConvertsToGlobal());
                    if (tp.hasValueTypeInHierarchy()){
                        var vt=tp.getAdapter(services.RAMLService);
                        vt.setGloballyDeclaredBy(cl);
                    }
                }
            }
        }
    });

    return u;
}

var processAnnotations = function (x:FieldWrapper, p:def.Property,annotations?:tsModel.Annotation[]) {
    if(!annotations){
        annotations = x.annotations();
    }
    annotations.forEach(x=> {
        var nm = x.name.substring(x.name.lastIndexOf(".") + 1)
        if (!aHandlers.annotationHandlers[nm]) {
            console.log("Can not find handler for:" );
        }
        aHandlers.annotationHandlers[nm](x, p);
    })
};
function createProp(x:FieldWrapper,clazz:def.NodeClass,t:def.IType,custom:boolean,annotations?:tsModel.Annotation[]){
    var p=def.prop(x.name(),"",clazz,t,custom)


    if (x.isMultiValue()){
        p.withMultiValue(true)
    }
    p.unmerge()
    if (!t){
        console.log(x.name()+":"+clazz.nameId()+" has undefined type");
    }
    if (!t.hasValueTypeInHierarchy()){
      t.properties().forEach(p0=>{
          if (p0.getAdapter(services.RAMLPropertyService).isKey()){
              var kp=p0.keyPrefix();
              if (kp) {
                  p.withKeyRestriction(kp);
                  p.merge()
              }
              var eo=p0.enumOptions();
              if (eo) {
                  p.withEnumOptions(eo)
                  p.merge()
              }
          }
      })
    }
    processAnnotations(x, p, annotations);
}