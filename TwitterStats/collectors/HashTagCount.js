var HashTagCount = function(notifier) {
    var _nonWordChar = /\W/,
        _scanner = function(regExp, text, callback) {
            while(text.search(regExp) !== -1) {
                match = regExp.exec(text);
                if(match && match[1]) {
                    callback(match[1].toLowerCase());
                }
                text = text.replace(regExp, "");
            }
        };

    this.hashTags   = { list: [], registry: {} };

    this.lastStats = undefined;

    this.processTweet = function(tweets) {
        tweets.forEach(function(tweet){
            this.processOtherHashTags(tweet.text);
        }, this);
        this.lastStats = { type: "HashTagCount", hashTags: this.hashTags.list };
        notifier.emit("stats", this.lastStats);
    };

    this.processOtherHashTags = function(text) {
        _scanner(/#(\w*)/i, text, function(hash){
            if(!this.hashTags.registry[hash]) {
                var obj = { hashTag: hash, count: 0 };
                this.hashTags.registry[hash] = obj;
                this.hashTags.list.push(obj);
            }
            this.hashTags.registry[hash].count++;
        }.bind(this));
    };

    notifier.addListener("newTweets", this.processTweet.bind(this));
    notifier.addListener("init", function(data) {
        this.hashTags   = { list: [], registry: {} };
        this.lastStats = undefined;
    }.bind(this));
};

exports.HashTagCount = HashTagCount;