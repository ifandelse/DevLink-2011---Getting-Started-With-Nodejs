var keys = require('./MyApiKeys.js'),
    twitter = require('ntwitter'),
    EventEmitter = require('events').EventEmitter,
    sys = require('sys');

var TwitterStreamer = function(trackOptions, threshold) {
    EventEmitter.call(this); // assume behaviors of event emitter

    var _twit = new twitter({
                consumer_key: keys.consumer_key,
                consumer_secret: keys.consumer_secret,
                access_token_key: keys.access_token_key,
                access_token_secret: keys.access_token_secret
        });

    this.tweets = [];

    this.threshold = threshold || 400;

    this.start = function() {
        _twit.stream('statuses/filter', trackOptions, function(stream) {
            stream.on('data', function (data) {
                if(data && data.user) {
                    if(this.tweets.filter(function(x) { return x.id === data.id_str; }).length === 0) {
                        var tweetData = {
                                            id: data.id_str,
                                            text: data.text,
                                            image: data.user.profile_image_url,
                                            user: data.user.screen_name,
                                            name: data.user.name,
                                            time: data.created_at
                                        };
                        console.log("Received Tweet From: " + tweetData.name);
                        this.tweets.unshift(tweetData);
                        if(this.tweets.length > this.threshold) {
                            this.tweets.splice(this.threshold, this.tweets.length - this.threshold);
                        }
                        this.emit("newTweet", tweetData);
                    }
                }
            }.bind(this));
        }.bind(this));
    };
};

// Sets TwitterStreamer.super_ and .prototype to instance of EventEmitter.prototype
sys.inherits(TwitterStreamer, EventEmitter);

exports.TwitterStreamer = TwitterStreamer;