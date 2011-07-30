/*function loadDir(directory, callback) {
    fs.readdir(directory, function onReaddir(err, files) {
        if (err) return callback(err);
        var count, results = {};
        files = files.filter(function (filename) {
            return filename[0] !== '.';
        });
        count = files.length;
        files.forEach(function (filename) {
            var path = directory + "/" + filename;
            fs.readFile(path, function onRead(err, data) {
                if (err) return callback(err);
                results[filename] = data;
                if (--count === 0) callback(null, results);
            });
        });
        if (count === 0) callback(null, results);
    });
}*/

var fs = require('fs');