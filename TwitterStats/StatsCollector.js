var StatsCollector = function(notifier) {
    var _nonWordChar = /\W/,
        _notifier = notifier,
        _scanner = function(regExp, text, callback) {
            while(text.search(regExp) !== -1) {
                match = regExp.exec(text);
                if(match && match[1]) {
                    callback(match[1]);
                }
                text = text.replace(regExp, "");
            }
        };
    
    this.tweeters = {
        list: [],
        registry: {}
    };
    this.mentions = {
        list: [],
        registry: {}
    };
    this.mentioners = {
        list: [],
        registry: {}
    };
    this.hashTags = {
        list: [],
        registry: {}
    };
    this.lastIdx = 0;

    this.processTweet = function(tweets) {
        tweets.forEach(function(tweet){
            this.processTweetCount(tweet);
            this.processMentions(tweet);
            this.processOtherHashTags(tweet.text);
        }, this);
        _notifier.emit("stats", this.getStatsObject());
    };

    this.getStatsObject = function() {
        return {
                    mentions: this.mentions.list,
                    mentioners: this.mentioners.list,
                    hashTags: this.hashTags.list,
                    tweeters: this.tweeters.list
               };
    };

    this.processTweetCount = function(tweet) {
        if(tweet.from_user) {
            if(!this.tweeters.registry[tweet.from_user]) {
                var obj = {user: tweet.from_user, count: 0, image: tweet.profile_image_url};
                this.tweeters.registry[tweet.from_user] = obj;
                this.tweeters.list.push(obj);
            }
            this.tweeters.registry[tweet.from_user].count++;
        }
    };

    this.processMentions = function(tweet) {
        _scanner(/@(\w*)/i, tweet.text, function(mentioned) {
            if(!this.mentions.registry[mentioned]) {
                var obj = { user: mentioned, count: 0 };
                this.mentions.registry[mentioned] = obj;
                this.mentions.list.push(obj);
            }
            this.mentions.registry[mentioned].count++;
            if(!this.mentioners.registry[tweet.from_user]) {
                var obj = { user: tweet.from_user, count: 0, image: tweet.profile_image_url };
                this.mentioners.registry[tweet.from_user] = obj;
                this.mentioners.list.push(obj);
            }
            this.mentioners.registry[tweet.from_user].count++;
        }.bind(this));
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

    _notifier.addListener("newTweets", this.processTweet.bind(this));
};

exports.StatsCollector = StatsCollector;