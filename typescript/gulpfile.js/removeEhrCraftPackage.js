var through = require('through');
var path = require('path');
function process(file,data,callback) {
    //console.log(`Processing file ${file}`)
    callback(data);
}

function transform(file) {
    var data = '',stream = through(write,end);

    return stream;

    function write(buf) {
        //data += buf;
        data += buf.toString('utf8')
            .replace(/(var ehrcraft_form_api_1)/gm,"// Kommentert ut av byggescript")
            .replace(/(ehrcraft_form_api_1\.)/gm,"");
        ;
    }
    function end() {
        process(file,data,function (result) {
            stream.queue(result);
            stream.queue(null);
        });
    }
    return through();
}
module.exports = transform;