var socket,
    viewModel = {
        showSearch: document.domain === 'localhost'
        ,
        newSearchTerm: ko.observable(""),
        searchTerm: ko.observable(""),
        tweeters: ko.observableArray([]),
        mentions: ko.observableArray([]),
        mentioners: ko.observableArray([]),
        hashTags: ko.observableArray([]),
        updateSearch: function() {
            if(this.newSearchTerm()) {
                this.searchTerm(""); // stops processing of any late-arriving results from the old search
                socket.emit("newSearch", { searchTerm: this.newSearchTerm(), origin: document.domain });
                this.newSearchTerm("");
            }
        }
    },
    userSort = function(left, right) {
                    if(left.count === right.count) {
                        return left.user === right.user ? 0 : (left.user.toLowerCase() < right.user.toLowerCase()) ? -1 : 1;
                    }
                    return left.count === right.count ? 0 : (left.count > right.count ? -1 : 1);
               };

viewModel.rTweeters = ko.dependentObservable(function() {
    return this.tweeters().sort(userSort);
}, viewModel);

viewModel.rMentions = ko.dependentObservable(function() {
    return this.mentions().sort(userSort);
}, viewModel);

viewModel.rMentioners = ko.dependentObservable(function() {
    return this.mentioners().sort(userSort);
}, viewModel);

viewModel.rHashTags = ko.dependentObservable(function() {
    var searchTerm = viewModel.searchTerm();
    return this.hashTags()
               .filter(function(x) { return x.hashTag !== searchTerm; })
               .sort(function(left, right) {
                    if(left.count === right.count) {
                        return left.hashTag === right.hashTag ? 0 : (left.hashTag.toLowerCase() < right.hashTag.toLowerCase()) ? -1 : 1;
                    }
                    return left.count === right.count ? 0 : (left.count > right.count ? -1 : 1);
               });
}, viewModel);

$(function() {
    socket = io.connect("http://" +document.domain + ':8001/');
    socket.on('connect', function () {
        socket.on('stats', function (stats) {
            if(stats.searchTerm === viewModel.searchTerm()) {
                viewModel.mentioners(stats.mentioners);
                viewModel.hashTags(stats.hashTags);
                viewModel.tweeters(stats.tweeters);
                var mentions = stats.mentions
                                    .map(function(x) {
                                        var src = stats.tweeters.filter(function(t) { return x.user.toLowerCase() === t.user.toLowerCase(); });
                                        if(src && src.length > 0) {
                                            x.image = src[0].image;
                                        }
                                        else {
                                            x.image = "templates/images/default_profile_1_normal.png";
                                        }
                                        return x;
                                    });
                viewModel.mentions(mentions);
            }
        });
        socket.on("init", function(data){
            if(viewModel.searchTerm() !== data.searchTerm) {
                viewModel.searchTerm(data.searchTerm);
                viewModel.tweeters([]);
                viewModel.mentions([]);
                viewModel.mentioners([]);
                viewModel.hashTags([]);
            }
        });
    });
    if(ko.externaljQueryTemplateEngine) {
        ko.externaljQueryTemplateEngine.setOptions({
            templateUrl: "templates",
            templatePrefix: "",
            templateSuffix: ".html"
        });
    }
    ko.applyBindings(viewModel);
});