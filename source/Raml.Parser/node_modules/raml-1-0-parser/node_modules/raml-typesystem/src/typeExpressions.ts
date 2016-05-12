import typeExpression=require("./typeExpressionParser")
import ts=require("./typesystem")
import schemaUtil = require('./schemaUtil')
import {ComponentShouldBeOfType} from "./restrictions";
import {AdditionalPropertyIs} from "./restrictions";
export interface BaseNode{
    type:string
}
export interface Union extends BaseNode{
    first: BaseNode
    rest: BaseNode
}

export interface Parens extends BaseNode{
    expr:  BaseNode
    arr: number
}
export interface Literal extends BaseNode{
    value: string
    arr?: number
    params?:BaseNode[];
}

export function parseToType(val:string,t:ts.TypeRegistry, contentProvider: schemaUtil.IContentProvider = null):ts.AbstractType{
    try {

        var q=val.trim();
        var json=q.charAt(0)=='{';
        if (json || q.charAt(0)=='<'){
            return new ts.ExternalType("", q, json, contentProvider);
        }

        var node:BaseNode = typeExpression.parse(val);
        var result= parseNode(node, t);
        return result;
    } catch (e){
        return ts.derive(val,[ts.UNKNOWN]);
    }
}

function wrapArray(a:number, result:ts.AbstractType):ts.AbstractType {
    while (a > 0) {
        var nt = ts.derive("", [ts.ARRAY]);
        nt.addMeta(new ComponentShouldBeOfType(result));
        result = nt;
        a--;
    }
    return result;
}
function parseNode(node:BaseNode,t:ts.TypeRegistry):ts.AbstractType
{
    if (node.type=="union"){
        var ut=<Union>node;
        return ts.union("",[parseNode(ut.first,t),parseNode(ut.rest,t)]);
    }
    else if (node.type=="parens"){
        var ps=<Parens>node;
        var rs=parseNode(ps.expr,t);
        return wrapArray(ps.arr,rs);
    }
    else{
        var lit=(<Literal>node);
        var result=t.get(lit.value);
        if (!result){
            result=ts.derive(lit.value,[ts.UNKNOWN]);
        }
        var a=lit.arr;
        return wrapArray(a, result);
    }
}


export function storeToString(t:ts.AbstractType):string{
    if (t.isSubTypeOf(ts.ARRAY)){
        var cm=t.oneMeta(ComponentShouldBeOfType);
        if (cm) {
            if (cm.value().isUnion()) {
                return "(" + storeToString(cm.value()) + ")" + "[]";

            }
            else return storeToString(cm.value()) + "[]";
        }
        return "array";
    }
    if (t instanceof ts.UnionType){
        var ut= <ts.UnionType>t;
        return ut.options().map(x=>storeToString(x)).join(" | ");
    }
    if (t.isAnonymous()){
        if (t.isEmpty()){
            return t.superTypes().map(x=>storeToString(x)).join(" , ");
        }
    }
    return t.name();
}

