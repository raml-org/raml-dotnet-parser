/// <reference path="../typings/main.d.ts" />

import modulesDetector = require("./linkedModuleDetector")
import cp = require('child_process')


export function execProcess(
    command:string,
    wrkDir:string,
    logEnabled:boolean = false,
    errLogEnabled:boolean = true,
    messageBefore:string = '',
    messageAfter:string = '',
    messageError:string = '',
    maxLogLength:number=-1,onError:(err)=>void=null) : number
{
    console.log("> "+wrkDir + " " + command)
    try {
        if (logEnabled) {
            console.log(messageBefore)
        }
        var logObj = cp.execSync(
            command,
            {
                cwd: wrkDir,
                encoding: 'utf8',
                stdio: [0,1,2]
            });

        if (logEnabled) {
            console.log(messageAfter);
            if (logObj) {
                var log = logObj.toString();
                if(log.trim().length>0) {
                    if (maxLogLength < 0) {
                        console.log(log)
                    }
                    else if (maxLogLength > 0) {
                        console.log(log.substring(0, Math.min(maxLogLength, log.length)))
                    }
                }
            }
        }

        return 0;
    }
    catch (err) {
        if (onError){
            onError(err);
        }
        if (errLogEnabled) {
            console.log(messageError)
            console.log(err.message)
        }

        return err.status;
    }
}

export function pullAll(rootFolder: string, workspaceDescriptorFile: string) {
    var modules = modulesDetector.getModules(rootFolder, workspaceDescriptorFile);

    var reversedModules = modules.reverse();

    reversedModules.forEach(module=>{
        var folder = module.fsLocation;
        if (folder) {
            if(execProcess("git pull", folder, true) != 0) {
                throw new Error("Failed to pull " + folder)
            }
        }
    })
}

export function buildAll(rootFolder: string, workspaceDescriptorFile: string) {
    var modules = modulesDetector.getModules(rootFolder, workspaceDescriptorFile);

    var reversedModules = modules.reverse();

    reversedModules.forEach(module=>{
        var folder = module.fsLocation;
        if (folder) {
            var buildCommand = module.buildCommand;
            if (buildCommand) {
                if(execProcess(buildCommand, folder, true) != 0) {
                    throw new Error("Failed to build " + folder)
                }
            }
        }
    })
}

export function testAll(rootFolder: string, workspaceDescriptorFile: string) {
    var modules = modulesDetector.getModules(rootFolder, workspaceDescriptorFile);

    var reversedModules = modules.reverse();

    reversedModules.forEach(module=>{
        var folder = module.fsLocation;
        if (folder) {
            var testCommand = module.testCommand;
            if (testCommand) {
                if(execProcess(testCommand, folder, true) != 0) {
                    throw new Error("Tests failed in " + folder)
                }
            }
        }
    })
}


