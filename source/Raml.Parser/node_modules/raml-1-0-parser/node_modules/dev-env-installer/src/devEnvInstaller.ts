/// <reference path="../typings/main.d.ts" />
import moduleUtils = require("./linkedModuleDetector")
import devUtils = require("./devUtils")
import path = require("path");
import fs = require("fs");

function getModuleGitFolderName(module : moduleUtils.DetectedModule) : string {
    var lastSlashPos = module.gitUrl.lastIndexOf("/");
    var gitExtPos = module.gitUrl.lastIndexOf(".git");
    if (gitExtPos == -1) gitExtPos = module.gitUrl.length;

    var moduleName = module.gitUrl.substr(lastSlashPos+1, gitExtPos - lastSlashPos - 1);
    return moduleName;
}

function getExistingModules(folder : string, modulesToTest: {[name:string] : moduleUtils.DetectedModule})
    : {[name:string] : moduleUtils.DetectedModule} {

    if (!fs.existsSync(folder)) return {};

    var result : {[name:string] : moduleUtils.DetectedModule} = {}

    moduleUtils.subDirectories(folder).forEach(subDirectory=>{
        var absolutePath = path.join(folder,subDirectory);
        var module = moduleUtils.moduleFromFolder(absolutePath, modulesToTest);
        if (module) {
            module.fsLocation = absolutePath;
            result[module.name] = module;
        }
    });

    return result;
}

function findModulePath(folder : string, module: moduleUtils.DetectedModule): string {

    if (!fs.existsSync(folder)) return null;

    var modules : {[name:string] : moduleUtils.DetectedModule} = {}
    modules[module.name] = module;

    moduleUtils.subDirectories(folder).forEach(subDirectory=>{
        var absolutePath = path.join(folder,subDirectory);
        var module = moduleUtils.moduleFromFolder(absolutePath, modules);
        if (module) {
            module.fsLocation = absolutePath;
        }
    });

    return module.fsLocation;
}

/**
 * Clones repositories to a subfolders of a folder, returns list of repositories absolute paths
 * @param rootPath
 * @param module
 */
function cloneRepositories(rootPath : string, modules: {[name:string] : moduleUtils.DetectedModule}) : string[] {

    var existingModules = getExistingModules(rootPath, modules);

    var result : string[] = [];

    Object.keys(modules).forEach(moduleName=>{
        var module = modules[moduleName];
        var modulePath = path.join(rootPath, getModuleGitFolderName(module));
        if (fs.existsSync(modulePath)) {

            console.log("Module " + moduleName + " already exists at " +
                modulePath + ", skip cloning");

            result.push(modulePath);
            return;
        }

        if (existingModules[moduleName]) {
            //handling the case when module folder does not match what git usually clones to (renamed folder).
            var realPath = existingModules[moduleName].fsLocation;

            console.log("Module " + moduleName + " already exists at " +
                realPath + ", skip cloning");

            result.push(realPath);
            return;
        }

        var cloneCommand = "git clone " + module.gitUrl + " --branch " + module.gitBranch + " --single-branch";

        if(devUtils.execProcess(cloneCommand, rootPath, true) != 0) {
            throw new Error("Failed to clone repository " + module.gitUrl + " : " + module.gitBranch);
        }
        var clonedModulePath = findModulePath(rootPath, module);
        if (!clonedModulePath) {
            console.log("Cloned module " + module.name + " does not match its name");
        } else {
            result.push(clonedModulePath);
        }
    })

    return result;
}

function registerNPMModules(repositoryRoots : string[]) {

    repositoryRoots.forEach(moduleFolder=>{
        if(devUtils.execProcess("npm link", moduleFolder, true) != 0){
            throw new Error("Could not npm link " + moduleFolder)
        }
    })
}

function npmInstall(repositoryRoots : string[]) {

    repositoryRoots.forEach(moduleFolder=>{
        if(devUtils.execProcess("npm install", moduleFolder, true) != 0) {
            throw new Error("Could not npm install " + moduleFolder)
        }
    })
}

function installTypings(repositoryRoots : string[], modules: {[name:string] : moduleUtils.DetectedModule}) {

    repositoryRoots.forEach(moduleFolder=>{
        var module = moduleUtils.moduleFromFolder(moduleFolder, modules);
        if (module && module.installTypings) {
            if (devUtils.execProcess("typings install", moduleFolder, true) != 0) {
                throw new Error("Could not install typings " + moduleFolder)
            }
        }
    })
}

function deleteFolderRecursive(folder : string) {
    if(fs.existsSync(folder) ) {
        fs.readdirSync(folder).forEach(fileName=>{
            var childPath = path.join(folder, fileName);
            if(fs.lstatSync(childPath).isDirectory()) {
                deleteFolderRecursive(childPath);
            } else {
                fs.unlinkSync(childPath);
            }
        });

        fs.rmdirSync(folder);
    }
};

function replaceDependenciesWithLinks(repositoryRoots : string[],
                                      modules: {[name:string] : moduleUtils.DetectedModule}) {
    repositoryRoots.forEach(repositoryRoot=>{
        var nodeModulesDir = path.join(repositoryRoot, "node_modules");
        if (!fs.existsSync(nodeModulesDir)) {
            fs.mkdir(nodeModulesDir);
        }

        moduleUtils.subDirectories(nodeModulesDir).forEach(subDirectoryName=>{
            var subDirectoryAbsolutePath = path.join(nodeModulesDir, subDirectoryName);

            if (fs.realpathSync(subDirectoryAbsolutePath) != subDirectoryAbsolutePath) return;

            var module = moduleUtils.moduleFromFolder(subDirectoryAbsolutePath, modules);
            if (!module) return;

            deleteFolderRecursive(subDirectoryAbsolutePath)

            if(devUtils.execProcess("npm link " + module.name, nodeModulesDir, true) != 0) {
                throw new Error("Could not npm link " + module.name + " in " + nodeModulesDir);
            }
        })
    })
}

function setupModules(repositoryRoots : string[], modules: {[name:string] : moduleUtils.DetectedModule}) {

    registerNPMModules(repositoryRoots);

    npmInstall(repositoryRoots);

    installTypings(repositoryRoots, modules);

    replaceDependenciesWithLinks(repositoryRoots, modules);
}

export function setUp(rootFolder : string, workspaceDescriptorFile : string) {

    var staticModulesMap = moduleUtils.loadModulesStaticInfo(workspaceDescriptorFile);

    var repositoryRoots = cloneRepositories(rootFolder, staticModulesMap)

    repositoryRoots.forEach(repositoryRoot=>console.log("Reporoot: " + repositoryRoot))
    setupModules(repositoryRoots, staticModulesMap);
}