import rt=require("./typesystem")
import meta=require("./metainfo")
import {ComponentShouldBeOfType} from "./restrictions";
import {PropertyIs} from "./restrictions";
import nm=require("./nominal-types")
export function example(t:rt.AbstractType):any{
    var ms=t.oneMeta(meta.Example);
    if (ms){
        return ms.example();
    }
    var ms1=t.oneMeta(meta.Examples);
    if (ms1){
        var examples=ms1.examples();
        if (examples&&examples.length>0){
            return examples[0];
        }
    }
    var d=t.oneMeta(meta.Default);
    if (d){
        return d.value();
    }
    if (t.isObject()){
        var result:any={};
        t.meta().forEach(x=>{
            if (x instanceof PropertyIs){
                var p:PropertyIs=x;
                var ex=example(p.value());
                result[p.propertyName()]=ex;
            }
        })
        t.superTypes().forEach(x=>{
            if (x.oneMeta(meta.Example)|| x.oneMeta(meta.Examples)) {
                var ex=example(x);
                if (ex && typeof ex === "object") {
                    Object.keys(ex).forEach(key=> {
                        result[key] = ex[key]
                    })
                }
            }
        })
        return result;
    }
    if (t.isArray()){
        var c=t.oneMeta(ComponentShouldBeOfType);
        var resultArray:any[]=[];
        if (c){
            resultArray.push(example(c.value()));
        }
        return resultArray;
    }
    if (t.isUnion()){
        return example(t.typeFamily()[0]);
    }
    if (t.isNumber()){
        return 1;
    }

    if (t.isBoolean()){
        return true;
    }
    return "some value";
}
class Example implements nm.IExpandableExample{

    constructor(private _value:any,private _empty:boolean=false){

    }

    isEmpty():boolean {
        return this._empty;
    }

    isJSONString():boolean {
        return typeof this._value==="string"&&((this._value+"").trim().indexOf("{")==0||(this._value+"").trim().indexOf("[")==0);
    }

    isXMLString():boolean {
        return typeof this._value==="string"&&(this._value+"").trim().indexOf("<")==0;
    }

    isYAML():boolean {
        if (typeof this._value==="string") {
            return !(this.isJSONString() || this.isXMLString());
        }
        return true;
    }

    asString():string {
        if (typeof this._value==="string"){
            return ""+this._value;
        }
        return this.expandAsString();
    }

    asJSON():any {
        if (this.isJSONString()){
            try {
                return JSON.parse(this._value);
            } catch (e){
                return null;
            }
        }
        if (this.isYAML()){
            return this._value;
        }
        return this.expandAsString();
    }

    original():any {
        return this._value;
    }

    expandAsString():string {
        return JSON.stringify(this.expandAsJSON(), null, 2);
    }

    expandAsJSON():any {
        return this._value;
    }
}
export function exampleFromNominal(n:nm.ITypeDefinition):nm.IExpandableExample[]{
    var tp=n.getAdapter(rt.InheritedType);
    if (tp){
        var ms1=tp.oneMeta(meta.Examples);
        if (ms1){
            var vl=ms1.value();
            var result:nm.IExpandableExample[]=[]
            if (vl && typeof vl === "object") {
                Object.keys(vl).forEach(key=> {
                    result.push(new Example(vl[key].content))

                })
            }
            return result;
        }

        var ms=tp.oneMeta(meta.Example);
        if (ms){

            var exampleV=ms.example();
            if (exampleV){
                return [new Example(ms.value())];
            }
        }
    }
    if (tp) {
        return [new Example(example(tp),true)];
    }
    return [];
}