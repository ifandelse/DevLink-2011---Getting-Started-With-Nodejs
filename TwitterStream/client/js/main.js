var socket;

var streamClient = {
    registry: [],
    tweets: ko.observableArray([]),
    total: ko.observable(0),
    init: function(data) {
        this.tweets([]);
        this.tweets(data.tweets);
    },
    initialized: false,
    tweetThresholdMet: false,
    tweetThreshold: 400
};

$(function() {
    socket = io.connect("http://" +document.domain + ':8088/');
    socket.on('connect', function () {
        socket.on('newTweet', function (tweet) {
            if(streamClient.registry.filter(function(x) { return x.id === tweet.id; }).length === 0) {
                streamClient.registry.unshift(tweet.id);
                streamClient.tweets.unshift(tweet);
                streamClient.total(streamClient.total() + 1);
                if(!streamClient.tweetThresholdMet) {
                    streamClient.tweetThresholdMet = streamClient.tweets().length > streamClient.tweetThreshold;
                }
                else {
                    streamClient.tweets.splice(streamClient.tweetThreshold, streamClient.tweets().length - streamClient.tweetThreshold);
                    streamClient.registry.splice(streamClient.tweetThreshold, streamClient.registry.length - streamClient.tweetThreshold);
                }
            }
        });
        socket.on("init", function(data){
            if(!streamClient.initialized) {
                streamClient.init(data);
                streamClient.total(data.tweets.length || 0);
                streamClient.initialized = true;
            }
        });
    });
    ko.applyBindings(streamClient);
});