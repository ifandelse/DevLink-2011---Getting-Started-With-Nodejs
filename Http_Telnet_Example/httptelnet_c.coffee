sockets = []

webSrv = require('http').createServer (request, response) ->
    response.writeHead 200, {'Content-Type': 'text/html'}
    response.write "<h3>You requested " + request.url + "</h3>"
    response.end()
    sockets.forEach (socket) ->
        socket.write request.method + "\t" + request.url + "\r\n"
webSrv.listen 8001

netSrv = require('net').Server (socket) ->
    sockets.push socket
    socket.write "welcome to the request notifier\r\n"
    socket.on 'close', ->
        i = sockets.indexOf socket
        sockets.splice(i, 1)
netSrv.listen 8000