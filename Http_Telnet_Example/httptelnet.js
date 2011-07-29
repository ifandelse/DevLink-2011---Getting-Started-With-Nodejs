var http = require('http');
var net = require('net');

var sockets = [];

var webSrv = http.createServer(function(request, response){
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("<h3>You requested " + request.url + "</h3>");
    response.end();
});

webSrv.on('request', function(request, response){
    var idx = 0,
        length = sockets.length;
    for(; idx < length; idx++) {
        sockets[idx].write(request.method + "\t" + request.url + "\r\n");
    }
});

webSrv.listen(8080);

var server = net.Server(function (socket) {
    sockets.push(socket);
    socket.write('welcome to the request notifier\n');
    socket.on('close', function () {
        var i = sockets.indexOf(socket);
        sockets.splice(i, 1);
    });
}).listen(8000);