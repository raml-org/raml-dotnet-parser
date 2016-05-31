/// <reference path="../typings/main.d.ts" />
import ts=require("./typesystem")
import restr=require("./restrictions")

import {AbstractType} from "./typesystem";
import {MapPropertyIs} from "./restrictions";
import {ComponentShouldBeOfType} from "./restrictions";
import {PropertyIs} from "./restrictions";
import {HasProperty} from "./restrictions";

export class SchemaWriter{

    map:{ [id: string]:string}={}

    root:any=null;

    generateRef(t:AbstractType){
        if (!t){
            return {};
        }
        if (t.isBuiltin()){
           return {
               type: this.getType(t)
           }
        }
        else if (t.isAnonymous())
        {
            return this.store(t);
        }
        if (t.isPolymorphic()){
            var tf= t.typeFamily();
            var ut=ts.union(t.name()+"Polymorph",tf);
            return this.store(t);
        }
        var typeInfo=this.store(t);
        if ((!this.root.hasOwnProperty("definitions"))){
            this.root["definitions"]={};
        }
        var ob=this.root["definitions"];
        ob[t.name()]=typeInfo;
        return {
            $ref:"#/definitions/"+ t.name()
        }
    }
    getType(t:AbstractType){
        if (t.isArray()){
            return "array";
        }
        else if (t.isBoolean()){
            return "boolean";
        }
        else if (t.isString()){
            return "string";
        }
        else if (t.isObject()){
            return "object";
        }
        else if (t.isNumber()){
            return "number";
        }
        else if (t.isScalar()){
            return "string";
        }
        return "unknown";
    }

    getResult(){
        return this.root;
    }

    store(t:AbstractType):any{
        if (t.isPolymorphic()){
            var tf= t.typeFamily();
            var ut=ts.union(t.name()+"Polymorph",tf);
            return this.store(t);
        }
        var res:any={};
        if (this.root==null){
            this.root=res;
            res["$schema"]="http://json-schema.org/draft-04/schema#";
        }
        var tv=this.getType(t);
        if (tv!=null){
            res["type"]=tv;
        }
        if (t.isArray()){
            res["additionalItems"]=false;
        }
        if (t.isObject()){
            res["additionalProperties"]=false;
        }
        if (t instanceof ts.InheritedType){
            var options=this.options(t.superTypes(),true);
            var optimized=false;
            if (options.length==1){
               var m=options[0];
               if (Object.keys(m).length==1){
                   if (m["anyOf"]){
                       res["anyOf"]=m["anyOf"];
                       optimized=true;
                   }
               }
            }
            if (options.length>0&&!optimized){
                res["allOf"]=options;
            }
        }
        if (t instanceof ts.UnionType){
            var ut:ts.UnionType=t;
            res["anyOf"]=this.options(ut.allOptions(),true);
            //TODO port optimization
            return res;
        }
        var ms=t.meta();
        ms.forEach(x=>{
            //FILL ME
        });
        var optimize=restr.optimize(t.restrictions());
        var pp:any={}
        var properties:any={}
        var required:string[]=[];
        optimize.forEach(x=>{
            if (x instanceof restr.AdditionalPropertyIs){
                var ap=<restr.AdditionalPropertyIs>x;
                if (ap.value()==ts.ANY){
                    res["additionalProperties"]=true;
                }
                else{
                    res["additionalProperties"]=this.generateRef(ap.value());
                }
            }
            if (x instanceof MapPropertyIs){
                var mp=<MapPropertyIs>x;
                if (mp.value()==ts.ANY){
                    pp[mp.regexpValue()]={};
                }
                else{
                    pp[mp.regexpValue()]=this.generateRef(mp.value());
                }

            }
            if (x instanceof ComponentShouldBeOfType){
                var cs=<ComponentShouldBeOfType>x;
                res["items"]=this.generateRef(cs.value());
                res["additionalItems"]=false;
            }
            if (x instanceof PropertyIs){
                var pi=<PropertyIs>x;
                properties[pi.propId()]=this.generateRef(pi.value());
            }
            if (x instanceof HasProperty){
                var rr=<HasProperty>x;
                required.push(rr.value());
            }
        })
        if (required.length>0){
            res["required"]=required;
        }
        if (Object.keys(properties).length>0){
            res["properties"]=properties;
        }
        if (Object.keys(pp).length>0){
            res["patternProperties"]=pp;
        }
        return res;
    }

    options(allOptions:AbstractType[],noBuiltIn:boolean):any[]{
        var res:any[]=[];
        allOptions.forEach(t=>{
            if (t.isBuiltin()&&noBuiltIn){
                return;
            }
            res.push(this.generateRef(t));
        })
        return res;
    }
}

