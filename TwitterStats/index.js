var events = require("events"),
    notifier = new events.EventEmitter(),
    express = require('express'),
    app = express.createServer(),
    io = require('socket.io').listen(app),
    TwitterSearch = require ('./TwitterSearch.js').TwitterSearch,
    StatsCollector = require('./StatsCollector.js').StatsCollector;


io.set('log level', 1);

var TwitterStatsApp = function(port, refreshInterval, notifier, searchTerm) {
    var _search,
        _stats,
        _searchTerm = searchTerm;

    this.sockets = [];

    this.latestStats = {};

    this.wireUpSocket = function(socket) {
        this.sockets.push(socket);
        console.log("Sending Init for first time connect");
        socket.emit("init", { searchTerm: _searchTerm });
        if(this.latestStats) {
            socket.emit("stats", this.latestStats); // on connect, push info to the client
        }
        socket.on('end', function (socket) {
            this.sockets = sockets.filter(function(s) { return s !== socket; });
        });
        socket.on('newSearch', function(data) {
            if(data.origin === "localhost") {
                console.log("NEW SEARCH from web socket client.");
                notifier.emit("newSearch", data);
            }
        });
    };

    notifier.addListener("stats", function(stats) {
        stats.searchTerm = _searchTerm;
        this.latestStats = stats;
        this.sockets.forEach(function(s) {
            s.emit("stats", stats);
        }, this);
    }.bind(this));
    notifier.addListener("newSearch", function(data) {
        console.log("New Search being handled by app: " + data.searchTerm);
        _searchTerm = data.searchTerm;
        this.latestStats = {};
        notifier.emit("init", { searchTerm: _searchTerm });
    }.bind(this));
    notifier.addListener("init", function(data) {
        console.log("Sending Init to " + this.sockets.length + " client(s) per notifier activity");
        this.sockets.forEach(function(s) {
            s.emit("init", data);
        }, this);
    }.bind(this));

    // Setup code exec'd as object spins up
    _search = new TwitterSearch(notifier, refreshInterval, searchTerm);
    _stats = new StatsCollector(notifier);
    
    app.use("/", express.static(__dirname + '/client'));
    app.listen(port);
    io.sockets.on('connection', this.wireUpSocket.bind(this));
    notifier.emit('init', { searchTerm: _searchTerm });
};

var twitterApp = new TwitterStatsApp(8001, 3000, notifier, "nodejs");
