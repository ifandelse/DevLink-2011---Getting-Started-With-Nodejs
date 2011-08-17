var fs = require('fs'),
    dir = "Files";

// Simple and naive example
fs.readdir(dir, function(err, files){
    console.log("Files in Directory:");
    files.filter(function(f) {
                    return f[0] !== ".";
                 })
         .forEach(function(x) {
                    fs.stat(dir + "/" + x, function(err, st) {
                        if(!st.isDirectory()) {
                            console.log("\t" + x);
                        }
                    });
                  });
});