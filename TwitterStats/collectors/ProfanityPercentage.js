var ProfanityPercentage = function(notifier) {

    // quick hack array - not going to go regex crazy for now
    var _badWords = [
        /\bfuck\b/i,
        /\bfucks\b/i,
        /\bfucking\b/i,
        /\bfucked\b/i,
        /\bfucker\b/i,
        /\bfuckers\b/i,
        /\bass\b/i,
        /\basses\b/i,
        /\basshole\b/i,
        /\bassholes\b/i,
        /\bshit\b/i,
        /\bshitted\b/i,
        /\bshitter\b/i,
        /\bshitters\b/i,
        /\bshitting\b/i,
        /\bshithead\b/i,
        /\bcunt\b/i,
        /\bcunts\b/i,
        /\bpussy\b/i,
        /\bdick\b/i,
        /\bdicks\b/i,
        /\bdickhead\b/i,
        /\bdickheads\b/i,
        /\bdamn\b/i,
        /\bdamned\b/i,
        /\bdamning\b/i,
        /\bcock\b/i,
        /\bpenis\b/i,
        /\bfag\b/i,
        /\bbitch\b/i,
        /\bfaggot\b/,
        /\bpiss\b/,
        /\bpissing\b/
    ];

    this.hasProfanity= function(text) {
        for(var i = 0; i < _badWords.length; i++) {
            if(text.search(_badWords[i]) !== -1)
            {
                return true;
            }
        }
        return false;
    };

    this.profanityStats = { clean: 0, explicit: 0 };

    this.lastStats = undefined;

    this.getPercentage = function() {
        var total = (this.profanityStats.clean + this.profanityStats.explicit);
        if(total === 0) {
            return 0;
        }
        else {
            return ((this.profanityStats.explicit / total) * 100).toFixed(2);
        }
    };

    this.processTweet = function(tweets) {
        tweets.forEach(function(tweet){
            this.profanitize(tweet);
        }, this);
        this.lastStats = { type: "ProfanityPercentage", percentage: this.getPercentage(), clean: this.profanityStats.clean, explicit: this.profanityStats.explicit };
        notifier.emit("stats", this.lastStats);
    };

    this.profanitize = function(tweet) {
        if(this.hasProfanity(tweet.text)) {
            this.profanityStats.explicit++;
        }
        else {
            this.profanityStats.clean++;
        }
    };

    notifier.addListener("newTweets", this.processTweet.bind(this));
    notifier.addListener("init", function(data) {
        this.profanityStats = { clean: 0, explicit: 0 };
        this.lastStats = undefined;
    }.bind(this));
};

exports.ProfanityPercentage = ProfanityPercentage;