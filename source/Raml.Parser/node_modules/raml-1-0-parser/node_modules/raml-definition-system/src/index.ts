import ts=require("ts-structure-parser")

export interface JSONDump{
    RAML08:ts.Module,
    RAML10:ts.Module
}
export var universeDumps:JSONDump={
    RAML08: toModule(require("./RAML08")),
    RAML10: toModule(require("./RAML10"))
}

function toModule(arr:any[]):any{

    var main = arr[0];
    var map = {}
    arr.forEach(x=>map[x['name']]=x);
    arr.forEach(x=>{
        var imports = x['imports'];
        Object.keys(imports).forEach(y=>{
            var name = imports[y];
            imports[y] = map[name];
        });
    });
    return main;
}