/// <reference path="../typings/main.d.ts" />

import fs = require("fs")
import path = require("path")
import def=require("./definitionSystem")

function generateJSONDumpOfDefSystem( ){
    var universe10 = def.getUniverse("RAML10")
    var universe08 =def.getUniverse("RAML08")

    var Universe10={};
    universe10.types().forEach(x=>{
        var props={};
        x.properties().forEach(y=>props[y.nameId()]={name:y.nameId()});
        (<def.NodeClass>x).customProperties().forEach(y=>props[y.nameId()]={name:y.nameId()});
        Universe10[x.nameId()]={

            name:x.nameId(),

            properties:props
        }
    })
    var Universe08={};
    universe08.types().forEach(x=>{
        var props={};
        x.properties().forEach(y=>props[y.nameId()]={name:y.nameId()});
        (<def.NodeClass>x).customProperties().forEach(y=>props[y.nameId()]={name:y.nameId()});
        Universe08[x.nameId()]={

            name:x.nameId(),

            properties:props
        }
    })
    var Universes={Universe08:Universe08,Universe10:Universe10}
    fs.writeFileSync( path.join(__dirname, '../src/universe.ts' ), "var Universes="+JSON.stringify( Universes, null, 2 )+";export=Universes")
}
generateJSONDumpOfDefSystem();