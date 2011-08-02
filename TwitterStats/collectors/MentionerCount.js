var MentionerCount = function(notifier) {
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

    this.mentioners = { list: [], registry: {} };

    this.lastStats = undefined;

    this.processTweet = function(tweets) {
        tweets.forEach(function(tweet){
            this.processMentioners(tweet);
        }, this);
        this.lastStats = { type: "MentionerCount", mentioners: this.mentioners.list };
        notifier.emit("stats", this.lastStats);
    };

    this.processMentioners = function(tweet) {
        _scanner(/@(\w*)/i, tweet.text, function(mentioned) {
            if(!this.mentioners.registry[tweet.from_user]) {
                var obj = { user: tweet.from_user, count: 0, image: tweet.profile_image_url };
                this.mentioners.registry[tweet.from_user] = obj;
                this.mentioners.list.push(obj);
            }
            this.mentioners.registry[tweet.from_user].count++;
        }.bind(this));
    };

    notifier.addListener("newTweets", this.processTweet.bind(this));
    notifier.addListener("init", function(data) {
        this.mentioners = { list: [], registry: {} };
        this.lastStats = undefined;
    }.bind(this));
};

exports.MentionerCount = MentionerCount;