var webpack = require('webpack');

var rimraf = require("rimraf");

var childProcess = require('child_process');

var path = require("path");

var fs = require("fs");

var isNpm = process.argv[process.argv.indexOf("--type") + 1] === 'npm';

if(isNpm) {
    rimraf.sync('browser_version');
    childProcess.execSync('mkdir browser_version');
} else {
    rimraf.sync('browser_version_bower');
    childProcess.execSync('mkdir browser_version_bower');
}

function webPackForBrowserLib() {
    var config = {
        entry: path.resolve(__dirname, "./dist/index.js"),

        output: {
            path: path.resolve(__dirname, isNpm ? "./browser_version" : "./browser_version_bower"),
            
            library: ['RAML.XmlValidation'],

            filename: 'index.js',
            libraryTarget: "umd"
        },

        module: {
            loaders: [
                { test: /\.json$/, loader: "json" }
            ]
        },
        externals: [
            {
                "ws" : true
            }
        ],
        node: {
            console: false,
            global: true,
            process: true,
            Buffer: true,
            __filename: true,
            __dirname: true,
            setImmediate: true
        }
    };

    webpack(config, function(err, stats) {
        if(err) {
            console.log(err.message);

            return;
        }

        console.log("Webpack Building Browser Bundle:");

        console.log(stats.toString({reasons : true, errorDetails: true}));

        updateVersion();

        if(isNpm) {
            childProcess.execSync('cd browser_version && npm publish');
        }
    });
}

function updateVersion() {
    var targetJsonPath = path.resolve(__dirname, (isNpm ? "./browser_version/package.json" : "./bower.json"));
    var packageJsonPath = path.resolve(__dirname, "./package.json");

    var targetJson = {};

    var packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());

    targetJson.version = packageJson.version;
    targetJson.name = packageJson.name + '-browser';
    targetJson.main = isNpm ? "index.js" : "browser_version_bower/index.js";

    if(!isNpm) {
        targetJson.ignore = [
            "*",
            "!browser_version_bower/",
            "!browser_version_bower/*"
        ]
    }

    fs.writeFileSync(targetJsonPath, JSON.stringify(targetJson, null, '\t'));
}

webPackForBrowserLib();