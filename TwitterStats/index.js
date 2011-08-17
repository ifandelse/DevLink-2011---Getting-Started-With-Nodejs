var TwitterStatsApp = require('./TwitterStatsApp.js').TwitterStatsApp,
    TweetCount = require('./collectors/TweetCount.js').TweetCount,
    MentionCount = require('./collectors/MentionCount.js').MentionCount,
    MentionerCount = require('./collectors/MentionerCount.js').MentionerCount,
    HashTagCount = require('./collectors/HashTagCount.js').HashTagCount,
    ProfanityPercentage = require('./collectors/ProfanityPercentage.js').ProfanityPercentage,
    events = require("events"),
    notifier = new events.EventEmitter();

var statCollectors = [new TweetCount(notifier),
                      new MentionCount(notifier),
                      new MentionerCount(notifier),
                      new HashTagCount(notifier),
                      new ProfanityPercentage(notifier)];

var twitterApp = new TwitterStatsApp(8002, 3000, notifier, "devlink", statCollectors);
