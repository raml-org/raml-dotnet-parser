/// <reference path="../typings/main.d.ts" />
declare function require(s:string):any;

import _ = require("underscore")

var ZSchema=require("z-schema");

export class ValidationResult{
    result:any;
    num:number;
}

var useLint=true;

class ErrorsCache {
    errors: any = {};

    getValue(key: any): any {
        return <any>this.errors[key];
    }

    setValue(key: any, value: any) {
        this.errors[key] = value;
    }
}

var globalCache = new ErrorsCache();

export interface IContentProvider {
    contextPath(): string;

    normalizePath(url: string): string;

    content(reference: string): string;

    hasAsyncRequests(): boolean;

    resolvePath(context: string, relativePath: string): string;

    isAbsolutePath(uri: string): boolean;
}

class DummyProvider implements  IContentProvider {
    contextPath(): string {
        return "";
    }

    normalizePath(url: string): string {
        return "";
    }

    content(reference: string): string {
        return "";
    }

    hasAsyncRequests(): boolean {
        return false;
    }

    resolvePath(context: string, relativePath: string): string {
        return "";
    }

    isAbsolutePath(uri: string): boolean {
        return false;
    }
}

export class JSONSchemaObject {
    jsonSchema: any;

    constructor(private schema:string, private provider: IContentProvider){
        if(!provider) {
            this.provider = new DummyProvider();
        } else {
            this.provider = provider;
        }

        if(!schema||schema.trim().length==0||schema.trim().charAt(0)!='{'){
            throw new Error("Invalid JSON schema content");
        }

        var jsonSchemaObject: any;

        try {
            var jsonSchemaObject = JSON.parse(schema);
        } catch(err){
            throw new Error("It is not JSON schema(can not parse JSON:"+err.message+")");
        }

        if(!jsonSchemaObject){
            return
        }

        try{
            var api: any = require('json-schema-compatibility');

            this.setupId(jsonSchemaObject, this.provider.contextPath());

            jsonSchemaObject =api.v4(jsonSchemaObject);
        } catch (e){
            throw new Error('Can not parse schema'+schema)
        }

        delete jsonSchemaObject['$schema']

        this.jsonSchema=jsonSchemaObject;
    }

    getType() : string {
        return "source.json";
    }

    validateObject (object:any): any{
        //TODO Validation of objects
        //xmlutil(content);
        this.validate(JSON.stringify(object));
    }

    getMissingReferences(references: any[], normalize: boolean = false): any[] {
        var result: any[] = [];

        var validator = new ZSchema();

        references.forEach(references => validator.setRemoteReference(references.reference, references.content || {}));

        validator.validateSchema(this.jsonSchema);

        var result = <any[]>validator.getMissingRemoteReferences();

        return normalize ? result.map(reference => this.provider.normalizePath(reference)) : result;
    }

    private getSchemaPath(schema: any, normalize: boolean = false): string {
        if(!schema) {
            return "";
        }

        if(!schema.id) {
            return "";
        }

        var id = schema.id.trim();

        if(!(id.lastIndexOf('#') === id.length - 1)) {
            return id;
        }

        var result =  id.substr(0, id.length -1);

        if(!normalize) {
            return result;
        }

        return this.provider.normalizePath(result);
    }

    private patchSchema(schema: any): any {
        if(!schema) {
            return schema;
        }

        if(!schema.id) {
            return schema;
        }

        var id = schema.id.trim();

        if(!(id.lastIndexOf('#') === id.length - 1)) {
            id = id + '#';

            schema.id = id;
        };

        var currentPath = id.substr(0, id.length -1);

        if(!this.provider.isAbsolutePath(currentPath)) {
            return schema;
        }

        currentPath = this.provider.normalizePath(currentPath);

        var refContainers: any[] = [];

        this.collectRefContainers(schema, refContainers);

        refContainers.forEach(refConatiner => {
            var reference = refConatiner['$ref'];

            if(typeof reference !== 'string') {
                return;
            }

            if(reference.indexOf('#') === 0) {
                return;
            }

            if(reference.indexOf('#') === -1) {
                reference = reference + '#';
            }

            if(!this.provider.isAbsolutePath(reference)) {
                refConatiner['$ref'] = this.provider.resolvePath(currentPath, reference).replace(/\\/g,'/');
            }
        });
    }

    private collectRefContainers(rootObject: any, refContainers: any): void {
        Object.keys(rootObject).forEach(key => {
            if(key === '$ref') {
                refContainers.push(rootObject);

                return;
            }

            if(!rootObject[key]) {
                return;
            }

            if(typeof rootObject[key] === 'object') {
                this.collectRefContainers(rootObject[key], refContainers);
            }
        });
    }

    validate(content: any, alreadyAccepted: any[] = []): void {
        var key = content + this.schema + this.provider.contextPath();

        var error = globalCache.getValue(key);

        if(error) {
            if(error instanceof Error) {
                throw error;
            }

            return;
        }

        var validator = new ZSchema();

        alreadyAccepted.forEach(accepted => validator.setRemoteReference(accepted.reference, accepted.content));

        validator.validate(JSON.parse(content), this.jsonSchema);

        var missingReferences = validator.getMissingRemoteReferences().filter((reference: any) => !_.find(alreadyAccepted, (acceptedReference: any) => reference === acceptedReference.reference));

        if(!missingReferences || missingReferences.length === 0) {
            this.acceptErrors(key, validator.getLastErrors(), true);

            return;
        }

        var acceptedReferences: any = [];

        missingReferences.forEach((reference: any) => {
            var remoteSchemeContent: any;

            var result: any = {reference: reference};

            try {
                var api = require('json-schema-compatibility');

                var jsonObject = JSON.parse(this.provider.content(reference));

                this.setupId(jsonObject, this.provider.normalizePath(reference));

                remoteSchemeContent = api.v4(jsonObject);

                delete remoteSchemeContent['$schema'];

                result.content = remoteSchemeContent;
            } catch(exception){
                result.error = exception;
            } finally {
                acceptedReferences.push(result);
            }
        });

        if(this.provider.hasAsyncRequests()) {
            return;
        }

        acceptedReferences.forEach((accepted: any) => {
            alreadyAccepted.push(accepted);
        });

        this.validate(content, alreadyAccepted);
    }

    private setupId(json: any, path: string): any {
        if(!path) {
            return;
        }

        if(!json) {
            return;
        }

        if(json.id) {
            return;
        }

        json.id = path.replace(/\\/g,'/') + '#';

        this.patchSchema(json);
    }

    private acceptErrors(key: any, errors: any[], throwImmediately = false): void {
        if(errors && errors.length>0){
            var res= new Error("Content is not valid according to schema:"+errors.map(x=>x.message+" "+x.params).join(", "));

            (<any>res).errors=errors;

            globalCache.setValue(key, res);

            if(throwImmediately) {
                throw res;
            }

            return;
        }

        globalCache.setValue(key, 1);
    }
}
export interface ValidationError{
    code:string
    params:string[]
    message:string
    path:string
}

export class XMLSchemaObject{
    constructor(private schema:string){
        if (schema.charAt(0)!='<'){
            throw new Error("Invalid JSON schema")
        }
        //xmlutil(schema);
    }

    getType() : string {
        return "text.xml";
    }

    validate (content:string){

        //xmlutil(content);
    }

    validateObject (object:any){
        //TODO Validation of objects
        //xmlutil(content);
    }
}
export interface Schema {
    getType(): string;
    validate(content: string): void;
    validateObject(object:any):void;
}
export function getJSONSchema(content: string, provider: IContentProvider) {
    var rs = useLint ? globalCache.getValue(content) : false;
    if (rs && rs.provider) {
        return rs;
    }
    var res = new JSONSchemaObject(content, provider);
    globalCache.setValue(content, res);
    return res;
}

export function getXMLSchema(content: string) {
    var rs = useLint ? globalCache.getValue(content) : false;
    if (rs) {
        return rs;
    }
    var res = new XMLSchemaObject(content);
    if (useLint) {
        globalCache.setValue(content, res);
    }
}

export function createSchema(content: string, provider: IContentProvider): Schema {

    var rs = useLint ? globalCache.getValue(content) : false;
    if (rs) {
        return rs;
    }
    try {
        var res: Schema = new JSONSchemaObject(content, provider);
        if (useLint) {
            globalCache.setValue(content, res);
        }
        return res;
    }
    catch (e) {
        try {
            var res: Schema = new XMLSchemaObject(content);
            if (useLint) {
                globalCache.setValue(content, res);
            }
            return res;
        }
        catch (e) {
            if (useLint) {
                globalCache.setValue(content, new Error("Can not parse schema"))
            }
            return null;
        }
    }
}