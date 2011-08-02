var TweetCount = function(notifier) {

    this.tweeters   = { list: [], registry: {} };

    this.lastStats = undefined;

    this.processTweet = function(tweets) {
        tweets.forEach(function(tweet){
            this.processTweetCount(tweet);
        }, this);
        this.lastStats = { type: "TweetCount", tweeters: this.tweeters.list };
        notifier.emit("stats", this.lastStats);
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

    notifier.addListener("newTweets", this.processTweet.bind(this));
    notifier.addListener("init", function(data) {
        this.tweeters   = { list: [], registry: {} };
        this.lastStats = undefined;
    }.bind(this));
};

exports.TweetCount = TweetCount;