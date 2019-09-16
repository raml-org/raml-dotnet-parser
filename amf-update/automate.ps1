param (
    [Parameter(Mandatory=$true)]
    [string]
    $targetFolder
)

"process started"

$targetNodeModules = Join-Path $targetFolder \node_modules\

# get version of latest amf package
$newVersion = npm view amf-client-js version

# get installed AMF version
$packageJsonPath = Join-Path $targetNodeModules package.json
If ((Test-Path -Path $packageJsonPath) -eq $false)
{
    "Package file not found: $packageJsonPath"
    return
}

$packageJson = Get-Content -Path $packageJsonPath -Raw
$package = ConvertFrom-Json -InputObject $packageJson
$currentVersion = $package.dependencies."amf-client-js"

If ($currentVersion -eq $null)
{
    "Unable to get installed version"
    return
}

# only continue if version has changed
If ($newVersion -like $currentVersion)
{
    "Version has not changed - installed: $currentVersion latest: $newVersion"
    return
}

"New version detected: $currentVersion latest: $newVersion"

# install AMF package to temp folder
# $tempFolder = Join-Path $env:TEMP $newVersion
# $tempFolder = Join-Path $temp $newVersion
$tempFolder = $env:TEMP # [System.IO.Path]::GetTempPath()
# New-Item -ItemType Directory -Path $tempFolder -ErrorAction Stop
cd $tempFolder

If (Test-Path -Path node_modules)
{
    Remove-Item -Path node_modules\ -recurse -ErrorAction Stop
}

"installing new version on $tempFolder"
npm init -y
npm install --save amf-client-js

"delete unnecessary files"
Remove-Item -Path node_modules\ -Include tsconfig.json -recurse
Remove-Item -Path node_modules\ -Include *.map -recurse
Remove-Item -Path node_modules\ -Include *.ts -recurse
Remove-Item -Path node_modules\ -Include readme.md -recurse
Remove-Item -Path node_modules\ -Include license* -recurse

"remove everything from $targetNodeModules except for package and parser"
Remove-Item -Path $targetNodeModules -Exclude parser.js, package.json -recurse

"copy new node module files to target"
$newModules = Join-Path $tempFolder \node_modules\
Copy-Item $newModules -Destination $targetNodeModules

$dotnetPath = "C:\desarrollo\mulesoft\automate-amf-update\AmfUpdate\AmfUpdate\bin\Debug\netcoreapp2.2"
$dotnetScript = Join-Path $dotnetPath AmfUpdate.dll
$targetProjFile = Join-Path $targetFolder AMF.Parser.csproj
"run dotnet script AmfUpdate.dll to update c# project file $targetProjFile"
dotnet $dotnetScript $targetProjFile false

"set new version $newVersion of AMF in package.json"
$package.dependencies."amf-client-js" = $newVersion
$packageJson = $package | ConvertTo-Json
Set-Content -Path $packageJsonPath -Value $packageJson

"process finished successfully"
