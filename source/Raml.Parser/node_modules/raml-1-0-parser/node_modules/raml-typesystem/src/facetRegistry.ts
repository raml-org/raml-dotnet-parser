import ts=require("./typesystem")
import rs=require("./restrictions")
import ms=require("./metainfo")


import {TypeInformation,  Abstract, Polymorphic} from "./typesystem";

import {MinProperties, MaxProperties, MinLength, MaxLength, MinItems , MaxItems, Minimum,
        Maximum, Enum, Pattern, UniqueItems,
        PropertyIs, AdditionalPropertyIs , MapPropertyIs, HasProperty, KnownPropertyRestriction, ComponentShouldBeOfType} from "./restrictions";

import {Default, Example, Description, DisplayName} from "./metainfo";
import {AbstractType} from "./typesystem";
import {XMLInfo} from "./metainfo";
import {Required} from "./metainfo";
import {Usage} from "./metainfo";



export class FacetPrototype{

    constructor(private _construct:()=>TypeInformation,private _constructWithValue:(x:any)=>TypeInformation){}

    isSimple(){
        return this._constructWithValue!=null;
    }

    newInstance():ts.TypeInformation{
        return this._construct();
    }
    createWithValue(v: any):ts.TypeInformation{
        return this._constructWithValue(v);
    }
    isApplicable(t:ts.AbstractType):boolean{
        return t.isSubTypeOf(this.newInstance().requiredType());
    }

    isInheritable():boolean{
        return this.newInstance().isInheritable();
    }
    isConstraint(){
        return this.newInstance() instanceof  ts.Constraint;
    }

    isMeta(){
        return !this.isConstraint();
    }

    name(){
        return this.newInstance().facetName();
    }
}

export class Registry {

    constraints:FacetPrototype[] = [
        new FacetPrototype(()=>new MinProperties(1), (x)=>new MinProperties(x)),//X
        new FacetPrototype(()=>new MaxProperties(1), (x)=>new MaxProperties(x)),//X
        new FacetPrototype(()=>new MinItems(1), (x)=>new MinItems(x)),//X
        new FacetPrototype(()=>new MaxItems(1), (x)=>new MaxItems(x)),//X
        new FacetPrototype(()=>new MinLength(1), (x) =>new MinLength(x)),//X
        new FacetPrototype(()=>new MaxLength(1), (x)=> new MaxLength(x)),//X
        new FacetPrototype(()=>new Minimum(1), (x)=>new Minimum(x)),//X
        new FacetPrototype(()=>new Maximum(1), (x)=>new Maximum(x)),//X
        new FacetPrototype(()=>new Enum([""]), (x)=>new Enum(x)),//X
        new FacetPrototype(()=>new Pattern("."), (x)=>new Pattern(x)),//X
        new FacetPrototype(()=>new PropertyIs("x", ts.ANY), null),//X
        new FacetPrototype(()=>new AdditionalPropertyIs(ts.ANY), null),//X
        new FacetPrototype(()=>new MapPropertyIs(".", ts.ANY), null),//X
        new FacetPrototype(()=>new HasProperty("x"), null),//X
        new FacetPrototype(()=>new UniqueItems(true), (x)=>new UniqueItems(x)),//X
        new FacetPrototype(()=>new ComponentShouldBeOfType(ts.ANY), null),//X
        new FacetPrototype(()=>new KnownPropertyRestriction(true), (x)=>new KnownPropertyRestriction(<boolean>x))
    ];

    meta:FacetPrototype[] = [
        new FacetPrototype(()=>new ms.Discriminator("kind"), (x)=>new ms.Discriminator(x)),//X
        new FacetPrototype(()=>new ms.DiscriminatorValue("x"), (x)=>new ms.DiscriminatorValue(x)),//X
        new FacetPrototype(()=>new Default(""), (x)=>new Default(x)),//X
        new FacetPrototype(()=>new Usage(""), (x)=>new Usage(x)),//X
        new FacetPrototype(()=>new Example(""), (x)=>new Example(x)),//X
        new FacetPrototype(()=>new Required(true), (x)=>new Required(x)),//X
        new FacetPrototype(()=>new ms.Examples({}), (x)=>new ms.Examples(x)),//X
        new FacetPrototype(()=>new Description(""), (x)=>new Description(x)),//X
        new FacetPrototype(()=>new DisplayName(""), (x)=>new DisplayName(x)),//X
        new FacetPrototype(()=>new Abstract(), (x)=>new Abstract()),
        new FacetPrototype(()=>new Polymorphic(), (x)=>new Polymorphic()),
        new FacetPrototype(()=>new XMLInfo({}), (x)=>new XMLInfo(x)),
    ];

    known:{ [name:string]:FacetPrototype}={};

    constructor(){
       this.allPrototypes().forEach(x=>this.known[x.name()]=x);
    }

    allPrototypes():FacetPrototype[] {
        return this.meta.concat(this.constraints);
    }
    buildFacet(n:string, value: any){
        if (this.known.hasOwnProperty(n)&&this.known[n].isSimple()){
            return this.known[n].createWithValue(value);
        }
        return null;
    }
    facetPrototypeWithName(n:string):FacetPrototype{
        if (this.known.hasOwnProperty(n)){
            return this.known[n];
        }
        return null;
    }
    applyableTo(t:AbstractType){
    return this.allPrototypes().filter(x=>x.isApplicable(t));
    }

    allMeta(){
        return this.allPrototypes().filter(x=>x.isMeta());
    }
}
var instance:Registry;
export function getInstance():Registry{
    if (instance){
        return instance;
    }
    instance=new Registry();
    return instance;
}



