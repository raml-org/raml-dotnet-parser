var gulp = require('gulp');
var typedoc = require("gulp-typedoc");

var childProcess = require('child_process');
var mocha = require('gulp-mocha');
var join = require('path').join;
var ts = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename')
var fs = require('fs');
var path = require('path');
var PORT = process.env.PORT || 3000;

var tsProject = ts.createProject('tsconfig.json', {
    typescript: require('typescript')
});

gulp.task("typedoc", function() {
    return gulp
        .src(["src/index.ts"])
        .pipe(typedoc({
            module: "commonjs",
            target: "es5",
            out: "docs/",
            name: "RAML TypeSystem",
            hideGenerator: true,
            excludeExternals: true,
            mode: "file",
            readme:"readmeTypeDoc.md"
        }))
        ;
});

gulp.task('typescript:compile', function () {
    var hasError = false;
    var tsResult = gulp.src(['**/*.ts', '!java/**', '!node_modules/**', '!examples/**', '!microsite/dist/examples/**', '!atom-package/**', '!custom_typings/**', '!typings/**'])
        .pipe(sourcemaps.init())
        .pipe(ts(tsProject))
        .on('error', function () {
            hasError = true;
        })
        .on('end', function () {
            if (hasError && !tsWatch) {
                throw new Error('TypeScript contains errors');
            }
        });

    return tsResult.js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('.'));
});

var testFiles = [
    'dist/tests/*.js'
];

gulp.task('test', [], function () {
    global.isExpanded = null;

    return gulp.src(testFiles, { read: false })
        .pipe(mocha({
            bail: false,
            reporter: 'spec'
        }));
});

gulp.task('build',['typescript:compile']);
