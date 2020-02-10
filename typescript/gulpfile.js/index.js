var gulp = require('gulp');
var ts = require('gulp-typescript');
var browserify = require('browserify');
var tap = require('gulp-tap');
const babel = require('gulp-babel');
var rename = require('gulp-rename');
var inject = require('gulp-inject-string');
const YAML = require('yaml');
const fs = require('fs');
const { watch,series,parallel } = require('gulp');
const del = require('del');
var through = require('through');
var log = require('gulplog');
let uglify = require('gulp-uglify-es').default;
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var bundler = require('./bundle');

var buffer = require('vinyl-buffer');
var transformEhrCraftPackage = require('./removeEhrCraftPackage');


function getFolderAndName() {
    const file = fs.readFileSync('./ehrcraft.config.yml','utf8');
    let n = YAML.parse(file);
    return n;

}



//ehrcraft_form_api_1.
function compress() {
    return gulp.src('./build/js/*.js')
        .pipe(uglify(/* options */))
        .pipe(gulp.dest('./build/dist'))


}

/**
 * Typescript compiler filene 
 */
function compile() {
    return gulp.src('src/**/*.ts')
        .pipe(ts({
            target: "es3",
            noImplicitAny: true,
            module: "commonjs",
            outDir: "ehrcraft"
        }))
        .pipe(babel({
            presets: ["@babel/typescript"],
            plugins: ["@babel/proposal-class-properties",
                "@babel/proposal-object-rest-spread"]
        }))
        .pipe(gulp.dest('./build'))

};

/**
 * Dette er trikset som gjør at FormRenderer starter scriptet vårt ved lasting. 
 * Ved å kalle funksjonen main(api) i index.js
 */
function setup() {
    let boot = "main(api, http);";
    return gulp.src("./build/index.js")
        .pipe(inject.append(boot))
        .pipe(gulp.dest("./build"));

};

/**
 * Benytter browserify for å bundle sammen javascript filene til en fil. 
 */
function oldbundle() {
    return gulp.src('./build/index.js',{ read: true })
        .pipe(tap(function (file) {
            log.info('bundling ' + file.path);
            // replace file contents with browserify's bundle stream
            file.contents = browserify(file.path,{
                debug: true,
                transform: [
                    //   removeEhrCraftFormRequire,
                    //    removeEhrCraftPackage,
                    removeEhrCraftFormRequire2,
                    removeEhrCraftPackage2
                ]
            }).bundle();

        })).pipe(gulp.dest('./build/js'));
};

function bundle(cb) {
    return browserify('./build/index.js')
        //.transform(bundler.removeEhrCraftPackage)
        .transform(transformEhrCraftPackage)
        .bundle()
        .pipe(source('index.js'))
        .pipe(buffer())
        .pipe(gulp.dest('./build/bundle'));
}

function olderbundle(cb) {
    bundler.bundleScript("./build/index.js","./build/bundle.js")
        .then(result => {
            console.log("Bundled finsihed");
            cb();
        }).catch(error => {
            console.error("Error bundling");
        })

}


/**
 * Kopierer den kompilerte fila til form_scripts folderen definert i ehrcraft.config.yml
 * @param {*} cb 
 */
function deployBundledFileToFormScripts(cb) {
    let n = getFolderAndName();
    let formScriptsFolder = n.form_scripts;
    let formName = n.form_name;
    console.log("Deploy to folder " + formScriptsFolder + ", file: " + formName + ".js");
    if (formScriptsFolder && formName) {
        return gulp.src('./build/bundle/index.js')
            .pipe(rename(formName + ".js"))
            .pipe(gulp.dest(formScriptsFolder));
    }
    else {
        cb();
    }

};

function cleanBuild() {
    return del('./build');

}

function cleanDist() {
    return del('./dist');
}
//exports.uglify = compress;
//exports.bundle = series(this.clean,this.compile,this.setup,this.bundle);
exports.build = series(compile,setup);
exports.bundle = bundle;
exports.clean = parallel(cleanBuild,cleanDist);
exports.deploy = series(this.clean,compile,setup,bundle,compress,deployBundledFileToFormScripts);
exports.default = function () {
    //watch('./src/*.ts',series(compile,setup,bundle,compress,deployBundledFileToFormScripts));
    //watch('./src/**/*.ts',series(compile,setup,bundle,compress,deployBundledFileToFormScripts));
    watch('./src/**/*.ts',series(compile,setup,bundle,deployBundledFileToFormScripts));
}

exports.justdeploy = deployBundledFileToFormScripts;


// 