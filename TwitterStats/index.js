var events = require("events"),
    notifier = new events.EventEmitter(),
    express = require('express'),
    app = express.createServer(),
    io = require('socket.io').listen(app),
    TwitterSearch = require ('./TwitterSearch.js').TwitterSearch,
    TweetCount = require('./collectors/TweetCount.js').TweetCount,
    MentionCount = require('./collectors/MentionCount.js').MentionCount,
    MentionerCount = require('./collectors/MentionerCount.js').MentionerCount,
    HashTagCount = require('./collectors/HashTagCount.js').HashTagCount,
    ProfanityPercentage = require('./collectors/ProfanityPercentage.js').ProfanityPercentage;


io.set('log level', 1);

var TwitterStatsApp = function(port, refreshInterval, notifier, searchTerm) {
    var _search,
        _stats,
        _searchTerm = searchTerm;

    this.sockets = [];

    this.statCollectors = [];

    this.wireUpSocket = function(socket) {
        this.sockets.push(socket);
        socket.emit("init", { searchTerm: _searchTerm });
        // on connect, push info to the client
        this.statCollectors.forEach(function(s) {
            if(s.lastStats !== undefined) {
                socket.emit("stats", s.lastStats);
            }
        });
        socket.on('end', function (socket) {
            this.sockets = sockets.filter(function(s) { return s !== socket; });
        });
        socket.on('newSearch', function(data) {
            if(data.origin === "localhost") {
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
        console.log("New Search: " + data.searchTerm);
        _searchTerm = data.searchTerm;
        notifier.emit("init", { searchTerm: _searchTerm });
    }.bind(this));
    notifier.addListener("init", function(data) {
        this.sockets.forEach(function(s) {
            s.emit("init", data);
        }, this);
    }.bind(this));

    // Setup code exec'd as object spins up
    _search = new TwitterSearch(notifier, refreshInterval, searchTerm);
    this.statCollectors.push(new TweetCount(notifier));
    this.statCollectors.push(new MentionCount(notifier));
    this.statCollectors.push(new MentionerCount(notifier));
    this.statCollectors.push(new HashTagCount(notifier));
    this.statCollectors.push(new ProfanityPercentage(notifier));

    app.use("/", express.static(__dirname + '/client'));
    app.listen(port);
    io.sockets.on('connection', this.wireUpSocket.bind(this));
    notifier.emit('init', { searchTerm: _searchTerm });
};

var twitterApp = new TwitterStatsApp(8001, 3000, notifier, "nodejs");
