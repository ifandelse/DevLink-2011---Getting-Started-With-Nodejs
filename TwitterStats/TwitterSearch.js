var query = require('querystring'),
    http = require('http');

var client = http.createClient(80, "search.twitter.com");

var TwitterSearch = function(notifier, refreshInterval) {
    var _searchPath = "/search.json",
        _timeoutFn;

    this.refreshInterval = refreshInterval || 5000;

    this.searchRegistry = {};
    
    this.tweetRegistry = {};

    this.buildUrl = function() {
        var srchQry;
        if(this.nextSearch) {
            srchQry = this.nextSearch;
        }
        else {
            if(!this.defaultSearch.since_id) {
                delete this.defaultSearch.since_id;
            }
            srchQry = "?" + query.stringify(this.defaultSearch);
        }
        return _searchPath + srchQry;
    };

    this.defaultSearch = {};

    this.nextSearch = undefined;

    this.runSearch = function() {
        var url = this.buildUrl();
        if(!this.searchRegistry[url]) {
            this.searchRegistry[url] = true;
            console.log(url);
            var request = client.request("GET", url , {"host": "search.twitter.com"});
            request.addListener("response", function(response) {
                var body = "";
                response.addListener("data", function(data) {
                    body += data;
                });

                response.addListener("end", function() {
                    notifier.emit("searched", JSON.parse(body));
                });
                _timeoutFn = setTimeout(this.runSearch.bind(this), this.refreshInterval);
            }.bind(this));
            request.end();
        }
        else {
            console.log("We have already searched " + url);
            _timeoutFn = setTimeout(this.runSearch.bind(this), this.refreshInterval);
        }
    };

    this.onSearched = function(payload) {
        // sift out errors
        if(!payload.error) {
            if(payload.results.length > 0) {
                console.log("Results: " + payload.results.length);
                this.processTweets(payload.results);
            }
            // do we have a next page option?  If so, let's use it
            if(payload.next_page) {
                this.nextSearch = payload.next_page;
            }
            if(payload.max_id) {
                this.defaultSearch.since_id = payload.max_id;
            }
        }
        else {
            this.nextSearch = undefined;
        }
    };

    this.processTweets = function(tweets) {
        var newTweets = tweets.filter(function(t) { return !this.tweetRegistry[t]; }, this);
        newTweets.forEach(function(tweet) {
            if(!this.tweetRegistry[tweet.id]) {
                this.tweetRegistry[tweet.id] = true;
            }
            // deal with the images that consistently fail from twitter...
            if(tweet.profile_image_url === "http://twitter.com/images/default_profile_normal.png" ||
               tweet.profile_image_url === "http://static.twitter.com/images/default_profile_normal.png") {
                tweet.profile_image_url = "templates/images/default_profile_1_normal.png";
            }
        }, this);
        notifier.emit("newTweets", newTweets);
    };

    notifier.addListener("searched", this.onSearched.bind(this));

    notifier.addListener("init", function(data) {
        console.log("TwitterSearch got an init: " + data.searchTerm);
        clearTimeout(_timeoutFn);
        this.defaultSearch = {
            q: data.searchTerm, 
            result_type: "recent",
            rpp: 100
        };
        this.nextSearch = undefined;
        this.searchRegistry = {};
        this.tweetRegistry = {};
        this.runSearch();
    }.bind(this));
};

exports.TwitterSearch = TwitterSearch;