var browserify = require('browserify');
var through = require('through');
const fs = require('fs');

/**
 * Denne fila er ikke i bruk - ligger her fordi den ble brukt for å teste ut funksjonene som brukes for å fjerne ehrcraft spesifikke forhold 
 */

const regexptest = function () {
    var data = '';
    return through(write,end);
    function write(buf) {
        data += buf.toString('utf8').replace(/(ehrcraft_form_api_1\.)/gm,"");
    }
    function end() {
        this.queue(data);
        this.queue(null);
    }
}
const removerequire = function () {
    var data = '';
    return through(write,end);
    function write(buf) {
        data += buf.toString('utf8').replace(/(var ehrcraft_form_api_1)/gm,"// Kommentert ut av byggescript");
    }
    function end() {
        this.queue(data);
        this.queue(null);
    }
}


/**
 * 
 * @param {string} inFile - the js file to bundle 
 * @param {string} outFile - the bundled js file to write to
 */
const bundleFile = function (inFile,outFile) {
    return new Promise((resolve,reject) => {
        try {
            var b = browserify();
            b.add(inFile);
            b.transform(regexptest);
            b.transform(removerequire);
            b.bundle()
                .pipe(fs.createWriteStream(outFile));
            resolve("OK");
        } catch (error) {
            reject(err);
        }
    });



}



exports.bundleScript = bundleFile;
exports.removeEhrCraftPackage = this.removeEhrCraftPackage;
exports.removeEhrCraftRequire = this.removeEhrCraftRequire;

