var events = require("events"),
    notifier = new events.EventEmitter(),
    express = require('express'),
    app = express.createServer(),
    io = require('socket.io').listen(app),
    TwitterSearch = require ('./TwitterSearch.js').TwitterSearch,
    StatsCollector = require('./StatsCollector.js').StatsCollector,
    sockets = [];

notifier.addListener("stats", function(stats) {
    sockets.forEach(function(s) {
        s.emit("stats", stats);
    });
});
notifier.addListener("tweets", function(tweets) {
    sockets.forEach(function(s) {
        s.emit("tweets", tweets);
    });
});

var search = new TwitterSearch(notifier, 3000, "congress"),
    stats = new StatsCollector(notifier);

search.start();

app.use("/", express.static(__dirname + '/client'));
app.listen(8001);
io.set('log level', 1);

io.sockets.on('connection', function (socket) {
    sockets.push(socket);
    socket.emit("init", {});
    socket.emit("stats", stats.getStatsObject()); // on connect, push info to the client
    socket.on('end', function (socket) {
        sockets = sockets.filter(function(s) { s !== socket; });
    });
});