var MentionCount = function(notifier) {
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

    this.mentions   = { list: [], registry: {} };

    this.lastStats = undefined;

    this.processTweet = function(tweets) {
        tweets.forEach(function(tweet){
            this.processMentions(tweet);
        }, this);
        this.lastStats = { type: "MentionCount", mentions: this.mentions.list };
        notifier.emit("stats", this.lastStats);
    };

    this.processMentions = function(tweet) {
        _scanner(/@(\w*)/i, tweet.text, function(mentioned) {
            if(!this.mentions.registry[mentioned]) {
                var obj = { user: mentioned, count: 0 };
                this.mentions.registry[mentioned] = obj;
                this.mentions.list.push(obj);
            }
            this.mentions.registry[mentioned].count++;
        }.bind(this));
    };

    notifier.addListener("newTweets", this.processTweet.bind(this));
    notifier.addListener("init", function(data) {
        this.mentions   = { list: [], registry: {} };
        this.lastStats = undefined;
    }.bind(this));
};

exports.MentionCount = MentionCount;