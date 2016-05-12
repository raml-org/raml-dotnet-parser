import pps= require("../src/parse");
import contentProviderModule = require('./contentprovider');

var contentProvider = new contentProviderModule.ContentProvider();

export function parseJSON(name: any, type: any, rt?:any): any {
    return pps.parseJSON(name, type, rt, contentProvider);
}

export function parseJSONTypeCollection(type: any, rt?: any): any {
    return pps.parseJSONTypeCollection(type, rt, contentProvider);
}

export function storeAsJSON(ts: any): any {
    return pps.storeAsJSON(ts);
}