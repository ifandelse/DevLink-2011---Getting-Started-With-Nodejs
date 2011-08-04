var twitter = require('ntwitter'),
    keys = require('./MyApiKeys.js'),
    express = require('express'),
    app = express.createServer(),
    io = require('socket.io').listen(app);

var TwitterStreamer = function(port, trackOptions) {
    var _twit = new twitter({
            consumer_key: keys.consumer_key,
            consumer_secret: keys.consumer_secret,
            access_token_key: keys.access_token_key,
            access_token_secret: keys.access_token_secret
        }),
        _tweets = [],
        _registry = {},
        _sockets = [],
        _wireUpSocket = function(socket) {
            _sockets.push(socket);
            console.log("Socket ID " + socket.id + "connecting...");
            console.log("Socket count now: " + _sockets.length);
            socket.emit("init", { tweets: _tweets });
            socket.on('end', function (socket) {
                _sockets = _sockets.filter(function(s) { return s !== socket; });
            });
        };

    io.set('log level', 1);
    app.use("/", express.static(__dirname + '/client'));
    app.listen(port);
    io.sockets.on('connection', _wireUpSocket);
    
    _twit.stream('statuses/filter', params, function(stream) {
        stream.on('data', function (data) {
            if(data && data.user) {
                if(!_registry[data.id_str]) {
                    _registry[data.id_str] = true;
                    var tweetData = {
                                        id: data.id_str,
                                        text: data.text,
                                        image: data.user.profile_image_url,
                                        user: data.user.screen_name,
                                        name: data.user.name,
                                        time: data.created_at
                                    };

                    console.log("Received Tweet From: " + tweetData.name);
                    _tweets.unshift(tweetData);
                    if(_tweets.length > 400) {
                        _tweets.splice(400, _tweets.length - 400);
                    }
                    _sockets.forEach(function(socket) {
                        socket.emit("newTweet", tweetData);
                    });
                }
            }
        });
    });
};

var params = { track: ["#webdev", "nodejs", "#nodejs", "javascript", "#javascript", "#ruby", "#python", "#csharp", "#mvc", "#coffeescript", "#jquery", "#css"] };
//var params = { track: ["#undateable"] }; // very busy hash tag for testing.  WARNING.  will depress your soul about the future of humanity.
var streamer = new TwitterStreamer(8088, params);