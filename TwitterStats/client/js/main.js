var socket,
    statsClient = {

        searchTerm: "",

        tweetUsers: [],
        
        updateSearch: function() {
            var newSearchTerm = $("#newSearchTerm").val();
            if(newSearchTerm) {
                this.searchTerm = ""; // will prevent further processing of stats from old search
                socket.emit("newSearch", { searchTerm: newSearchTerm, origin: document.domain });
            }
        },

        populate: function(data, templateName, targetElemSelector) {
            if(typeof $.template(templateName) !== 'function') {
                $.template( templateName, templateFinder.getTemplateNode(templateName));
            }
            $(targetElemSelector).empty();
            $.tmpl(templateName, data).appendTo(targetElemSelector);
        },

        userSort: function(left, right) {
            if(left.count === right.count) {
                return left.user === right.user ? 0 : (left.user.toLowerCase() < right.user.toLowerCase()) ? -1 : 1;
            }
            return left.count === right.count ? 0 : (left.count > right.count ? -1 : 1);
        },

        hashSort: function(left, right) {
            if(left.count === right.count) {
                return left.hashTag === right.hashTag ? 0 : (left.hashTag.toLowerCase() < right.hashTag.toLowerCase()) ? -1 : 1;
            }
            return left.count === right.count ? 0 : (left.count > right.count ? -1 : 1);
        },

        TweetCount: function(stats) {
            var tweeters = stats.tweeters.sort(this.userSort);
            this.tweetUsers = tweeters;
            this.populate({ tweeters: tweeters }, "tweeters", "#tweetersContainer");
        },

        MentionCount: function(stats) {
            var mentions = stats.mentions
                                .map(function(x) {
                                    var src = this.tweetUsers.filter(function(t) { return x.user.toLowerCase() === t.user.toLowerCase(); });
                                    if(src && src.length > 0) {
                                        x.image = src[0].image;
                                    }
                                    else {
                                        x.image = "templates/images/default_profile_1_normal.png";
                                    }
                                    return x;
                                }, this);
            this.populate({ mentions: stats.mentions.sort(this.userSort) }, "mentions", "#mentionsContainer");
        },

        MentionerCount: function(stats) {
            this.populate({ mentioners: stats.mentioners.sort(this.userSort) }, "mentioners", "#mentionersContainer");
        },

        HashTagCount: function(stats) {
            var hashTags = stats.hashTags
                                .filter(function(x) { return x.hashTag.toLowerCase() !== statsClient.searchTerm.toLowerCase(); })
                                .sort(this.hashSort);
            this.populate({ hashTags: hashTags }, "hashtags", "#hashtagsContainer");
        },

        ProfanityPercentage: function(stats) {
            console.log("Percentage: " + stats.percentage + ", clean: " + stats.clean + ", explicit: " + stats.explicit);
        },

        init: function(data) {
            this.searchTerm = data.searchTerm;
            $("#searchTerm").html(data.searchTerm);
            $("#tweetersContainer").empty();
            $("#mentionersContainer").empty();
            $("#mentionsContainer").empty();
            $("#hashtagsContainer").empty();
        }
    };

$(function() {
    socket = io.connect("http://" +document.domain + ':8001/');
    socket.on('connect', function () {
        socket.on('stats', function (stats) {
            if(stats.searchTerm === statsClient.searchTerm) {
                statsClient[stats.type](stats);
            }
        });
        socket.on("init", function(data){
            if(statsClient.searchTerm !== data.searchTerm) {
                statsClient.init(data);
            }
        });
    });
    if(document.domain !== "localhost") {
        $("#searchPanel").remove();
    }
    if(templateFinder) {
        templateFinder.setOptions({
            templateUrl: "templates",
            templatePrefix: "",
            templateSuffix: ".html"
        });
    }
});