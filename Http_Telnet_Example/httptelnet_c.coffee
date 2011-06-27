sockets = []

notify = (socket, request) ->
    socket.write request.method + "\t" + request.url + "\r\n"

webSrv = require('http').createServer (request, response) ->
    response.writeHead 200, {'Content-Type': 'text/html'}
    response.write "<h3>You requested " + request.url + "</h3>"
    response.end()
webSrv.listen 8080

webSrv.on 'request', (request, response) ->
        notify(client, request) for client in sockets

netSrv = require('net').Server (socket) ->
    sockets.push socket
    socket.write "welcome to the request notifier\r\n"
    socket.on 'close', ->
        i = sockets.indexOf socket
        sockets.splice(i, 1)
netSrv.listen 8000

