/// <reference path="../typings/main.d.ts" />

//helper to find a sub-hierarchy of fs-linked modules from a list, including real fs locations

import fs = require("fs");
import path = require("path");
import _=require("underscore")


export interface DetectedModule {
    name : string,
    buildCommand : string,
    testCommand : string,
    fsLocation : string,
    dependencies : DetectedModule[],
    gitUrl: string,
    gitBranch: string,
    installTypings: boolean
}

function detectModulesInFolder(folder : string, modulesToDetect : {[name:string] : DetectedModule},
                               parent : DetectedModule) {

    var nodeModulesFolder = path.join(folder, "node_modules");
    if (!fs.existsSync(nodeModulesFolder)) nodeModulesFolder = folder;

    subDirectories(nodeModulesFolder).forEach(subDirectory=>{
        var fullSubdirPath = path.join(nodeModulesFolder, subDirectory);

        var subModule = moduleFromFolder(fullSubdirPath, modulesToDetect);
        
        if (subModule) {
            subModule.fsLocation = fs.realpathSync(fullSubdirPath);

            if (parent) {
                if (!parent.dependencies) {
                    parent.dependencies = [];
                }

                if (!_.find(parent.dependencies, dependency=>dependency.name == subModule.name)) {
                    parent.dependencies.push(subModule)
                }
            }

            detectModulesInFolder(fullSubdirPath, modulesToDetect, subModule);
        }
    })
}

export function getModules(rootFolder : string, workspaceDescriptorFile: string) : DetectedModule[] {

    var result : DetectedModule[] = [];

    var modulesMap = loadModulesStaticInfo(workspaceDescriptorFile);
    var rootModule = moduleFromFolder(rootFolder, modulesMap);
    if (rootModule) {
        rootModule.fsLocation = fs.realpathSync(rootFolder);
    }

    detectModulesInFolder(rootFolder, modulesMap, rootModule);

    Object.keys(modulesMap).forEach(moduleName=>{
        result.push(modulesMap[moduleName]);
    })

    return result;
}

export function moduleFromFolder(folder : string, modulesToDetect : {[name:string] : DetectedModule}) : DetectedModule {
    var moduleFolderName = path.basename(folder);
    var moduleName = getModuleName(folder);

    var module = null;
    if (moduleFolderName && modulesToDetect[moduleFolderName]) {
        module = modulesToDetect[moduleFolderName];
    } else if (moduleName && modulesToDetect[moduleName]) {
        module = modulesToDetect[moduleName];
    }

    return module;
}

function getModuleName(rootModulePath : string) : string {
    var packageJsonPath = path.join(rootModulePath, "package.json");
    if (!fs.existsSync(packageJsonPath)) return null;

    var packageJsonContents = fs.readFileSync(packageJsonPath).toString();

    var config = JSON.parse(packageJsonContents);

    return config.name;
}

export function subDirectories(folder : string) : string[] {
    return fs.readdirSync(folder).filter(childName => {
        return fs.statSync(path.join(folder, childName)).isDirectory();
    });
}

export function loadModulesStaticInfo(workspaceDescriptor: string) : {[name:string] : DetectedModule} {

    var modulesListContent = fs.readFileSync(workspaceDescriptor).toString();

    var list = JSON.parse(modulesListContent);

    var result : {[name:string] : DetectedModule} = {};
    Object.keys(list).forEach(moduleName => {
        var obj = list[moduleName];

        var module = {
            name : moduleName,
            buildCommand : obj.build,
            testCommand : obj.test,
            gitUrl: obj.gitUrl,
            gitBranch: (obj.gitBranch?obj.gitBranch:"master"),
            installTypings:(obj.installTypings?obj.installTypings:false)
        }

        result[moduleName] = <DetectedModule>module;
    })

    return result;
}


