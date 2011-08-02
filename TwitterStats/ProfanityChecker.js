
var profanityChecker = {

    badWords: [
        /(fuck)/i,
        /ass/i,
        /asses/i,
        /asshole/i,
        /shit/i,
        /shithead/i,
        /cunt/i,
        /cunts/i,
        /pussy/i,
        /dick/i,
        /dickhead/i,
        /damn/i
    ],

    hasProfanity: function(text) {
        
    }
};

exports.profanityaCheck = profanityChecker.hasProfanity;