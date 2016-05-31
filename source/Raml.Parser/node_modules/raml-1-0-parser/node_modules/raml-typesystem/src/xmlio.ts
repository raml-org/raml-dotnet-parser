/// <reference path="../typings/main.d.ts" />
import xml2js=require("xml2js")
import ts=require("./typesystem")
import {PropertyIs} from "./restrictions";

export function readObject(content:string,t:ts.AbstractType):any{
    var result:any=null;
    var opts:xml2js.Options={};
    opts.explicitChildren=false;
    opts.explicitArray=false;
    opts.explicitRoot=false;
    xml2js.parseString(content,opts,function (err,res){
        result=res;
        if (err){
            throw new Error();
        }
    });
    result=postProcess(result,t);
    return result;
}

function postProcess(result:any,t:ts.AbstractType):any{
    t.meta().forEach(x=>{
        if (x instanceof PropertyIs){
            var pi:PropertyIs=x;
            if (pi.value().isNumber()){
                if (result.hasOwnProperty(pi.propertyName())){
                    var vl=parseFloat(result[pi.propertyName()]);
                    if (!isNaN(vl)){
                        result[pi.propertyName()]=vl;
                    }
                }
            }
            if (pi.value().isBoolean()){
                if (result.hasOwnProperty(pi.propertyName())){
                    var bvl=result[pi.propertyName()];
                    if (bvl=="true"){
                        result[pi.propertyName()]=true;
                    }
                    if (bvl=="false"){
                        result[pi.propertyName()]=false;
                    }
                }
            }
        }
    });
    return result;
}