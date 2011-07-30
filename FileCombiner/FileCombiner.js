var lazy = require("lazy"),
    fs  = require("fs"),
    dir = "Files",
    destFile = "./Files/Output/output.txt",
    outfile = fs.createWriteStream(destFile, {'flags' : 'a'});

try{
    fs.unlinkSync(destFile);
}
catch(exception) {
    console.log("File didn't previously exist.");
}


var fileProcessor = function(filepath) {
    new lazy(fs.createReadStream(filepath))
        .lines
        .forEach(function(line){
            outfile.write(filepath + "\t" + line + "\r\n");
        });
};

// combiner....
fs.readdir(dir, function(err, files){
    files.filter(function(f) {
                    return f[0] !== ".";
                 })
         .forEach(function(file) {
                    fs.stat(dir + "/" + file, function(err, st) {
                        if(st.isFile()) {
                            fileProcessor(dir + "/" + file);
                        }
                    });
                  });
});
