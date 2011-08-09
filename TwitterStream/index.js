var express = require('express'),
    app = express.createServer(),
    io = require('socket.io').listen(app),
    TwitterStreamer = require('./TwitterStreamer.js').TwitterStreamer,
    profiler = require('v8-profiler');

//var params = { track: [ "#devlink", "devlink", "#devlink2011", "devlink2011", "#webdev", "#nodejs", "#javascript", "#fsharp" ] };
var params = { track: [ "#undateable", "#fb" ] };
var streamer = new TwitterStreamer(params, 400);

var Server = function(port, streamer) {
    var _sockets = [],
        _snapShots = 0,
        _wireUpSocket = function(socket) {
            _sockets.push(socket);
            console.log("Socket ID " + socket.id + " connecting...");
            console.log("Socket count now: " + _sockets.length);
            socket.emit("init", { tweets: streamer.tweets });
            socket.on('end', function (socket) {
                _sockets.splice(_sockets.indexOf(socket,1));
            });
            profiler.takeSnapshot("SnapShot " + ++_snapShots);
        },
        _updateClients = function(payload) {
            _sockets.forEach(function(socket) {
                socket.emit("newTweet", payload);
            });
        };

    io.set('log level', 1);
    app.use("/", express.static(__dirname + '/client'));
    app.listen(port);
    io.sockets.on('connection', _wireUpSocket);
    streamer.on("newTweet", _updateClients);
    streamer.start();
};
// Be sure to include profiler = require('v8-profiler');
profiler.startProfiling('startup');
var server = new Server(8088, streamer);
profiler.stopProfiling('startup');