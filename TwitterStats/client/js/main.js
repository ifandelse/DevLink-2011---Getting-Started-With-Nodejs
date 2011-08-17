var socket,
    statsClient = {

        searchTerm: "",

        tweetUsers: [],
        
        updateSearch: function() {
            var newSearchTerm = $("#newSearchTerm").val();
            if(newSearchTerm) {
                this.searchTerm = ""; // will prevent further processing of stats from old search
                this.clear();
                socket.emit("newSearch", { searchTerm: newSearchTerm, origin: document.domain });
            }
        },

        populate: function(data, templateName, targetElemSelector) {
            if(typeof $.template(templateName) !== 'function') {
                $.template( templateName, templateFinder.getTemplateNode(templateName));
            }
            var div = $("<div />");
            $.tmpl(templateName, data).appendTo(div);
            if($(targetElemSelector).children().length === 0) {
                div.children().appendTo($(targetElemSelector));
            }
            else {
                div.children().replaceAll($(targetElemSelector).children());
            }
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
            stats.total = stats.clean + stats.explicit;
            stats.percentage = stats.percentage;
            this.populate(stats, "profperc", "#profPercContainer");
            if(stats.percentage < 30) {
                $("#profPercentage").css("color", "#006400");
            }
            else if (stats.percentage < 60) {
                $("#profPercentage").css("color", "#ff8c00");
            }
            else {
                $("#profPercentage").css("color", "#ff0000");
            }
        },

        init: function(data) {
            this.searchTerm = data.searchTerm;
            $("#searchTerm").html(data.searchTerm);
            this.clear();
        },

        clear: function() {
            $("#tweetersContainer").empty();
            $("#mentionersContainer").empty();
            $("#mentionsContainer").empty();
            $("#hashtagsContainer").empty();
            $("#profPercContainer").empty();
        }
    };

$(function() {
    socket = io.connect("http://" +document.domain + ':8002/');
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