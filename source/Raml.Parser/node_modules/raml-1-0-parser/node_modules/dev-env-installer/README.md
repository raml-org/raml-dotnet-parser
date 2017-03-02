# dev-env-installer <sup>(beta)</sup>

[![Build Status](https://travis-ci.org/mulesoft-labs/dev-env-installer.svg?branch=master)](https://travis-ci.org/mulesoft-labs/dev-env-installer)

For listed NPM modules having GitHub URL and branch:
* Clones repositories locally
* Installs NPM dependencies for each repository
* Cross-links dependencies for cloned repositories
* Installs typings
* Provides "pull all", "build all" and "test all" commands

## Usage
* Add installer as dev. dependency to a module
* Add `workspace.json` to the root of the cloned module repository:

```
{
  "npm-module-name-1" : {
    "build" : "npm run build",
    "test" : "gulp test",
    "gitUrl" : "https://github.com/org/npm-module-1.git",
    "gitBranch" : "devBranch",
    "installTypings" : true
  },

  "npm-module-name-2" : {
    "build" : "gulp build",
    "gitUrl" : "https://github.com/org/npm-module-2.git"
  },
}
```
The only required field for module is `gitUrl`.

With current directory set to a root of the module repository:

`dev-env-installer install`:
* Clones all repositories listed in `workspace.json`, does not clone repository if already exist in workspace root. If no `gitBranch` is specified, clones `master` branch. Uses `--single-branch`.
* For each repository executes `npm install`
* For each repository executes `npm link`
* For each dependency `<npm-dependency-name>` of each repository, which is listed in `workspace.json` removes the one installed by NPM and executes `npm link <npm-dependency-name>`
* For each repository having `installTypings: true` executes `typings install`

`dev-env-installer pullall` - for each repository in `workspace.json` in reverse order executes `git pull`

`dev-env-installer buildall` - for each repository in `workspace.json` in reverse order executes the command listed as `build` in `workspace.json`. Skips if no command specified.

`dev-env-installer testall` - for each repository in `workspace.json` in reverse order executes the command listed as `test` in `workspace.json`. Skips if no command specified.

Optional CLI parameters:
* `--workspace` sets up workspace root. If not specified, workspace root is either a parent dir if executed for a module or current dir if no module is found.
* `--descriptor` sets up `workspace.json` path. If not specified, is searched in the current dir, module dir or workspace root.
