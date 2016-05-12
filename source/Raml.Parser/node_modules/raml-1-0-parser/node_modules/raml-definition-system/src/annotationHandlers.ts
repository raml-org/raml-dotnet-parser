/// <reference path="../typings/main.d.ts" />
import tsModel=require("ts-structure-parser")
import def=require("./definitionSystem")
import khttp=require ("know-your-http-well");
import _=require("underscore")
var services=def;
export interface AnnotationHandler{
    (a:tsModel.Annotation,f:def.Property)
}
export function handleTypeAnnotation(a:tsModel.Annotation,rangeType:def.NodeClass){
    if (a.name == 'MetaModel.declaresSubTypeOf') {//FIXME should be handled in same way as method annotations
        rangeType.getAdapter(services.RAMLService).setExtendedTypeName(<string>a.arguments[0]);
    }
    if (a.name == 'MetaModel.nameAtRuntime') {//FIXME should be handled in same way as method annotations
        rangeType.setNameAtRuntime(<string>a.arguments[0]);
    }
    if (a.name == 'MetaModel.description') {//FIXME should be handled in same way as method annotations
        rangeType.withDescription(<string>a.arguments[0]);
    }
    if (a.name == 'MetaModel.inlinedTemplates') {
        rangeType.getAdapter(services.RAMLService).setInlinedTemplates(true);
    }
    if (a.name == 'MetaModel.requireValue') {//FIXME should be handled in same way as method annotations
        rangeType.getAdapter(services.RAMLService).withContextRequirement("" + <string>a.arguments[0], "" + <string>a.arguments[1]);
    }
    if (a.name == 'MetaModel.referenceIs') {//FIXME should be handled in same way as method annotations
        rangeType.getAdapter(services.RAMLService).withReferenceIs("" + <string>a.arguments[0]);
    }
    //MetaModel.referenceIs
    if (a.name == 'MetaModel.actuallyExports') {//FIXME should be handled in same way as method annotations
        rangeType.getAdapter(services.RAMLService).withActuallyExports("" + <string>a.arguments[0]);
    }
    if (a.name == 'MetaModel.convertsToGlobalOfType') {//FIXME should be handled in same way as method annotations
        rangeType.getAdapter(services.RAMLService).withConvertsToGlobal("" + <string>a.arguments[0]);
    }
    if (a.name == 'MetaModel.allowAny') {//FIXME should be handled in same way as method annotations
        rangeType.getAdapter(services.RAMLService).withAllowAny();
    }
    if (a.name == 'MetaModel.allowQuestion') {
        rangeType.getAdapter(services.RAMLService).withAllowQuestion();
    }

    if (a.name == 'MetaModel.alias') {//FIXME should be handled in same way as method annotations
        rangeType.getAdapter(services.RAMLService).addAlias("" + <string>a.arguments[0]);
    }
    if (a.name == 'MetaModel.consumesRefs') {//FIXME should be handled in same way as method annotations
        rangeType.getAdapter(services.RAMLService).setConsumesRefs(true);
    }
    if (a.name == 'MetaModel.canInherit') {//FIXME should be handled in same way as method annotations
        rangeType.getAdapter(services.RAMLService).withCanInherit("" + <string>a.arguments[0]);
    }
    if (a.name == 'MetaModel.definingPropertyIsEnough') {//FIXME should be handled in same way as method annotations
        rangeType.getAdapter(services.RAMLService).definingPropertyIsEnough("" + <string>a.arguments[0]);
    }
    if (a.name == 'MetaModel.customHandling') {
        rangeType.setCustom(true);
    }
    if (a.name == 'MetaModel.superclasses') {
        rangeType.getAdapter(services.RAMLService).registerSupertypes(<string[]>a.arguments[0]);
    }
}

export var annotationHandlers:{[name:string]:AnnotationHandler}={
    key:(a:tsModel.Annotation,f:def.Property)=>{
        f.withFromParentKey();
        f.withKey(true)
    },
    value:(a:tsModel.Annotation,f:def.Property)=>{
        f.withFromParentValue()
    },
    canBeValue:(a:tsModel.Annotation,f:def.Property)=>{
        f.withCanBeValue()
    },
    unmerged:(a:tsModel.Annotation,f:def.Property)=>{
        f.unmerge();
    },
    startFrom:(a:tsModel.Annotation,f:def.Property)=>{
        f.withKeyRestriction(<string>a.arguments[0])
        f.merge()
    },
    oneOf:(a:tsModel.Annotation,f:def.Property)=>{
        f.withEnumOptions(<string[]>a.arguments[0])
    },
    oftenKeys:(a:tsModel.Annotation,f:def.Property)=>{
        f.withOftenKeys(<string[]>a.arguments[0])
    },
    embeddedInMaps:(a:tsModel.Annotation,f:def.Property)=>{
        f.getAdapter(services.RAMLPropertyParserService).withEmbedMap()
    },
    system:(a:tsModel.Annotation,f:def.Property)=>{
        f.getAdapter(services.RAMLPropertyParserService).withSystem(true)
    },
    required:(a:tsModel.Annotation,f:def.Property)=>{
        if (a.arguments[0]!='false'&&a.arguments[0]!==false) {
            f.withRequired(true)
        }
    },
    noDirectParse:(a:tsModel.Annotation,f:def.Property)=>{
        if (a.arguments[0]!='false'&&a.arguments[0]!==false) {
            f.withNoDirectParse()
        }
    },
    setsContextValue:(a:tsModel.Annotation,f:def.Property)=>{
        f.addChildValueConstraint(new def.ChildValueConstraint(""+a.arguments[0],""+a.arguments[1]))
        //f.withKeyRestriction(<string>a.arguments[0])
    },
    defaultValue:(a:tsModel.Annotation,f:def.Property)=>{
        f.setDefaultVal(""+a.arguments[0])
    },
    defaultIntegerValue:(a:tsModel.Annotation,f:def.Property)=>{
        f.setDefaultIntegerVal(a.arguments[0])
    },
    defaultBooleanValue:(a:tsModel.Annotation,f:def.Property)=>{
        f.setDefaultBooleanVal(a.arguments[0])
    },
    facetId:(a:tsModel.Annotation,f:def.Property)=>{
        if (a.arguments[0]=="minItems"){
            f.setFacetValidator((x,f)=>{
                if (x instanceof Array){
                    var length=(<any>Number).parseInt(""+f.value());
                    if (length>x.length){
                        return "array should contain at least "+f.value()+" items";
                    }
                }
                return null;
            });
        }
        if (a.arguments[0]=="enum"){
            f.setFacetValidator((x,f)=>{
                var validateAgainst=x+"";
                var array:string[]=f;
                try {
                    if (!array.some(x=>x == validateAgainst)) {
                        return "value should be one of :" + array.join(",")
                    }
                } catch (e){
                    return ;
                }
                return null;
            });
        }
        if (a.arguments[0]=="maxItems"){
            f.setFacetValidator((x,f)=>{
                if (x instanceof Array){
                    var length=(<any>Number).parseInt(""+f);
                    if (length<x.length){
                        return "array should contain not more then "+f.value()+" items";
                    }
                }
                return null;
            });
        }
        if (a.arguments[0]=="minProperties"){
            f.setFacetValidator((x,f)=>{
                if (x instanceof Object){
                    var length=(<any>Number).parseInt(""+f);
                    if (length>Object.keys(x).length){
                        return "object should contain at least "+f.value()+" properties";
                    }
                }
                return null;
            });
        }
        if (a.arguments[0]=="maxProperties"){
            f.setFacetValidator((x,f)=>{
                if (x instanceof Object){
                    var length=(<any>Number).parseInt(""+f);
                    if (length<Object.keys(x).length){
                        return "object should contain not more then "+f.value()+" properties";
                    }
                }
                return null;
            });
        }
        if (a.arguments[0]=="uniqueItems"){
            f.setFacetValidator((x,f)=>{
                if (f instanceof Array){
                    var length=_.unique(<any[]>f).length;
                    if (length<f.length){
                        return "array should contain only unique items";
                    }
                }
                return null;
            });
        }
        if (a.arguments[0]=="minLength"){
            f.setFacetValidator((x,f)=>{
                if (typeof x=='number'||typeof x=='boolean') {
                    x = "" + x
                }
                if (typeof x=='string'){
                    var length=(<any>Number).parseInt(""+f);
                    if (length>x.length){
                        return "string length should be at least "+length;
                    }
                }
                return null;
            });
        }
        if (a.arguments[0]=="maxLength"){
            f.setFacetValidator((x,f)=>{
                if (typeof x=='number'||typeof x=='boolean') {
                    x = "" + x
                }
                if (typeof x=='string'){
                    var length=(<any>Number).parseInt(""+f);
                    if (length<x.length){
                        return "string length should be not more then "+length;
                    }
                }
                return null;
            });
        }
        if (a.arguments[0]=="minimum"){
            f.setFacetValidator((x,f)=>{
                if (typeof x=='string') {
                    x =parseFloat(x);
                }
                if (typeof x=='number'){
                    var length=parseFloat(f)
                    if (length>x){
                        return "value should be not less then "+length;
                    }
                }
                return null;
            });
        }
        if (a.arguments[0]=="maximum"){
            f.setFacetValidator((x,f)=>{
                if (typeof x=='string') {
                    x =parseFloat(x);
                }
                if (typeof x=='number'){
                    var length=parseFloat(f);
                    if (length<x){
                        return "value should be not more then "+length;
                    }
                }
                return null;
            });
        }
        if (a.arguments[0]=="pattern"){
            f.setFacetValidator((x,f)=>{
                if (typeof x=='number'||typeof x=='boolean') {
                    x = "" + x
                }
                if (typeof x=='string'){
                    var regExp=new RegExp(f);
                    if (!regExp.test(x)){
                        return "string should match to "+f;
                    }
                }
                return null;
            });
        }
    },
    extraMetaKey:(a:tsModel.Annotation,f:def.Property)=>{
        if (a.arguments[0]=="statusCodes"){
            f.withOftenKeys(khttp.statusCodes.map(x=>x.code))
            f.setValueDocProvider((name:string)=>{
                var s= _.find(khttp.statusCodes,x=>x.code==name);
                if (s){
                    return (name+":"+s.description);
                }
                return null;
            })
        }
        if (a.arguments[0]=="headers"){
            f.setValueSuggester(x=>{
                if (x.property()) {
                    var c = (<def.Property>x.property()).getChildValueConstraints();
                    if (_.find(c, x=> {
                            return x.name == "location" && x.value == "Params.ParameterLocation.HEADERS"
                        })) {
                        return khttp.headers.map(x=>x.header);
                    }
                    if (x.property()) {
                        if (x.property().nameId() == "headers") {
                            return khttp.headers.map(x=>x.header);
                        }
                    }
                }
                return null;
            })
            f.setValueDocProvider((name:string)=>{
                var s= _.find(khttp.headers,x=>x.header==name);
                if (s){
                    return (name+":"+s.description);
                }
                return null;
            })
        }
        if (a.arguments[0]=="methods"){
            f.setValueDocProvider((name:string)=>{
                var s= _.find(khttp.methods,x=>x.method==name.toUpperCase());
                if (s){
                    return (name+":"+s.description);
                }
                return null;
            })
            //f.withEnumOptions(khttp.methods.map(x=>x.method.toLowerCase()))
        }
    },
    requireValue:(a:tsModel.Annotation,f:def.Property)=>{
        f.withContextRequirement(""+a.arguments[0],""+a.arguments[1])
        //f.withKeyRestriction(<string>a.arguments[0])
    },
    allowMultiple:(a:tsModel.Annotation,f:def.Property)=>{
        f.withMultiValue(true);
        //f.withKeyRestriction(<string>a.arguments[0])
    },

    constraint:(a:tsModel.Annotation,f:def.Property)=>{

        //f.withKeyRestriction(<string>a.arguments[0])
    },
    newInstanceName:(a:tsModel.Annotation,f:def.Property)=>{
        f.withNewInstanceName(""+a.arguments[0])
        //f.withKeyRestriction(<string>a.arguments[0])
    },

    declaringFields:(a:tsModel.Annotation,f:def.Property)=>{
        f.withThisPropertyDeclaresFields();
        //f.withKeyRestriction(<string>a.arguments[0])
    },
    describesAnnotation:(a:tsModel.Annotation,f:def.Property)=>{
        //f.withReferenceParameters();
        f.withDescribes(<string>a.arguments[0])
    },
    allowNull:(a:tsModel.Annotation,f:def.Property)=>{
        f.withAllowNull()
    }
    ,

    descriminatingProperty:(a:tsModel.Annotation,f:def.Property)=>{
        //f.withReferenceParameters();
        f.withDescriminating(true)
    },
    description:(a:tsModel.Annotation,f:def.Property)=>{
        f.withDescription(""+a.arguments[0])
        //f.withReferenceParameters();
        //f.withDescriminating(true)
    },
    inherited:(a:tsModel.Annotation,f:def.Property)=>{
        f.withInherited(true);
    },


    selfNode:(a:tsModel.Annotation,f:def.Property)=>{
        f.withSelfNode();
    },

    grammarTokenKind:(a:tsModel.Annotation,f:def.Property)=>{
        f.getAdapter(services.RAMLPropertyService).withPropertyGrammarType(""+a.arguments[0])
    },
    canInherit:(a:tsModel.Annotation,f:def.Property)=>{
        f.withInheritedContextValue(""+a.arguments[0])
    },
    canBeDuplicator:(a:tsModel.Annotation,f:def.Property)=>{
        f.setCanBeDuplicator()
    },
    example:(a:tsModel.Annotation,f:def.Property)=>{
        f.getAdapter(services.RAMLPropertyService).setExample(true)
    },

    typeExpression:(a:tsModel.Annotation,f:def.Property)=>{
    f.getAdapter(services.RAMLPropertyService).setTypeExpression(true)
    },
    hide:(a:tsModel.Annotation,f:def.Property)=>{
        if(a.arguments.length==0){
            f.getAdapter(services.RAMLPropertyDocumentationService).setHidden(true);
        }
        else {
            f.getAdapter(services.RAMLPropertyDocumentationService).setHidden(<boolean>a.arguments[0]);
        }
    },
    documentationTableLabel:(a:tsModel.Annotation,f:def.Property)=>{
        f.getAdapter(services.RAMLPropertyDocumentationService).setDocTableName(""+a.arguments[0]);
    },
    markdownDescription:(a:tsModel.Annotation,f:def.Property)=>{
        f.getAdapter(services.RAMLPropertyDocumentationService).setMarkdownDescription(""+a.arguments[0]);
    },
    valueDescription:(a:tsModel.Annotation,f:def.Property)=>{
        f.getAdapter(services.RAMLPropertyDocumentationService).setValueDescription(a.arguments[0] != null ? (""+a.arguments[0]):null);
    },
    customHandling:(a:tsModel.Annotation,f:def.Property)=>{

    }
}
export function recordAnnotation(p:def.Property,a:tsModel.Annotation){
    annotationHandlers[a.name](a,p);
}