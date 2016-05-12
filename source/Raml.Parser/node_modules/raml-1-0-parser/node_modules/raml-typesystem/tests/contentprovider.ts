//import _ = require("underscore")
/// <reference path="../typings/main.d.ts" />
declare function require(s:string):any;
declare var __dirname: string;

var path = require('path');
var URL = require('url');
var fs = require('fs');

var rootPath = path.resolve(__dirname, '../../tests/root.json');

class Unit {
    private _absolutePath: string;

    private _content: string = '';

    constructor(newPath: string, parent: Unit = null) {
        this._absolutePath = (newPath && parent || (!path.isAbsolute(newPath) && parent)) ? path.resolve(path.dirname(parent.absolutePath()), newPath) : newPath;

        if(fs.existsSync(this._absolutePath)) {
            this._content = fs.readFileSync(this._absolutePath).toString();
        }
    }

    absolutePath(): string {
        return this._absolutePath;
    }

    resolve(newPath: string): Unit {
        return new Unit(newPath, this);
    }

    contents(): string {
        return this._content;
    }
}

export class ContentProvider {
    private unit = new Unit(rootPath);

    contextPath() {
        if(!this.unit) {
            return "";
        }

        var rootPath = this.unit.absolutePath();

        return rootPath || "";
    }

    normalizePath(url: string): string {
        if (!url) {
            return url;
        }

        var result: string;

        if (!isWebPath(url)) {
            result = path.normalize(url);
        } else {
            var prefix = url.toLowerCase().indexOf('https') === 0 ? 'https://' : 'http://';

            result = prefix + path.normalize(url.substring(prefix.length));
        }

        return result;
    }
    
    content(reference: string): string {
        var absolutePath = this.normalizePath(reference);

        var unit = this.unit.resolve(absolutePath);
        
        if(!unit) {
            return "";
        }
        
        return unit.contents() || "";
    }

    hasAsyncRequests(): boolean {
        return false;
    }

    resolvePath(context: string, relativePath: string): string {
        if(!relativePath || !context) {
            return relativePath;
        }

        var result: string;

        if(!isWebPath(context)) {
            result =  path.resolve(path.dirname(context), relativePath);
        } else {
            result = URL.resolve(context,relativePath);
        }

        return result;
    }

    isAbsolutePath(uri: string): boolean {
        if(!uri) {
            return false;
        }

        if(isWebPath(uri)) {
            return true;
        }

        return path.isAbsolute(uri);
    }
}

function isWebPath(str: string):boolean {
    return false;
}