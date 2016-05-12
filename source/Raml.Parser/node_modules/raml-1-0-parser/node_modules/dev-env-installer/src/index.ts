import devUtils = require("./devUtils")
import installer = require("./devEnvInstaller")

/**
 * Performs a pull for all modules.
 * @param workspaceRootFolder - root folder for modules.
 * @param workspaceDescriptorFile - file describing workspace.
 */
export function pullAll(workspaceRootFolder: string, workspaceDescriptorFile: string) {
    devUtils.pullAll(workspaceRootFolder, workspaceDescriptorFile);
}

/**
 * Performs a build for all modules having build command specified.
 * @param workspaceRootFolder - root folder for modules.
 * @param workspaceDescriptorFile - file describing workspace.
 */
export function buildAll(workspaceRootFolder: string, workspaceDescriptorFile: string) {
    devUtils.buildAll(workspaceRootFolder, workspaceDescriptorFile);
}

/**
 * Performs a test for all modules having test command specified.
 * @param workspaceRootFolder - root folder for modules.
 * @param workspaceDescriptorFile - file describing workspace.
 */
export function testAll(workspaceRootFolder: string, workspaceDescriptorFile: string) {
    devUtils.testAll(workspaceRootFolder, workspaceDescriptorFile);
}

/**
 * Clones modules into root folder, performs npm install, typings install if required, sets up npm cross-links.
 * @param workspaceRootFolder - root folder for modules.
 * @param workspaceDescriptorFile - file describing workspace.
 */
export function installWorkspace(workspaceRootFolder : string, workspaceDescriptorFile : string) {
    installer.setUp(workspaceRootFolder, workspaceDescriptorFile);
}