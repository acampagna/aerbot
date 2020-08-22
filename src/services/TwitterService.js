const CoreUtil = require("../utils/Util.js");
const mongoose = require('mongoose');
const Aerbot = mongoose.model('Aerbot');
const DateDiff = require("date-diff");
const Twit = require('twit');
var Jimp = require('jimp');

/**
 * Service to manage Tweeting. 
 * @author acampagna
 * @copyright Dauntless Gaming Community 2020
 */

const T = new Twit({
  consumer_key:         'ZrBZtJoKM5fA26I4KF2Y1kDs8',
  consumer_secret:      '29jJlZ8UauceXhkKeClJiUbBft0HTNZPTW2a9P77c4pOv9NsZJ',
  access_token:         '1087225474907099136-pNVgmxeBjoJhS3u7jyErSUKZ4Bo6E7',
  access_token_secret:  'VgrNAIhh4g64TbdsF5h7J4yN1XRZOgieaoH3Id3JijZE4'
});

class TwitterService {

  constructor(){
    if(! TwitterService.instance){
      this._data = [];
      TwitterService.instance = this;
    }

    return TwitterService.instance;
  }

  initialize() {

  }

  async v2tweet(message) {
    console.log("V2 TWEET");

    const now = new Date();
    var lastTweetDate;
    var _this = this;
    const image = message.attachments.size > 0 ? await this.getImage(message.attachments.array()[0].url) : '';
    const imageFilename = message.attachments.array()[0].filename;

    Aerbot.get("last_tweet_date").then(meta => {
      console.log(meta);
      if(meta) {
        lastTweetDate = new Date(meta.value);
      } else {
        lastTweetDate = new Date();
		    lastTweetDate.setDate( lastTweetDate.getDate() - 1);
      }
      
      if(new DateDiff(now, lastTweetDate).minutes() >= 60) {
        //const image = message.attachments.size > 0 ? await this.getImage(message.attachments.array()[0].url) : '';
        //const image = "";

        if(image && image !== '') {
          Aerbot.set("last_tweet_date", now);
          this.v2downloadImage(image, 'res/tmp/' + imageFilename, this.v2TweetWithImage(message.member.displayName + "'s picture was pinned: " + message.cleanContent, 'res/tmp/' + imageFilename));
        } else {
          //this.tweetWithoutImage(message);
        }
        console.log("[[[Tweeted]]] " + message.cleanContent + "(" + "res/tmp/" + imageFilename + ")");

      } else {
        console.log("Tweeted too recently. Not tweeting!");
      }
    });
  }

  v2TweetWithImage(message) {
    console.log("V2 TWEETING WITH IMAGE!");
    T.postMediaChunked({ file_path: imagePath }, function (err, data, response) {
      if(!err) {
          console.log(data);
          var mediaIdStr = data.media_id_string;

          var params = { status: message, media_ids: [mediaIdStr] }
          T.post('statuses/update', params, function (err, data, response) {
              console.log(data);
          });
      } else {
          console.error(err);
      }
    });
  }
  

  v2tweetWithoutImage(message) {
    console.log("V2 TWEETING WITHOUT IMAGE!");
    var params = { status: `${message.member.displayName}: ${message.cleanContent}` }
    T.post('statuses/update', params, function (err, data, response) {
        console.log(data);
        if(err) {
          console.error(err);
        }
    });
  }

  tweet(message, imagePath) {
    const now = new Date();
    var lastTweetDate;

    Aerbot.get("last_tweet_date").then(meta => {
      console.log(meta);
      if(meta) {
        lastTweetDate = new Date(meta.value);
      } else {
        lastTweetDate = new Date();
		    lastTweetDate.setDate( lastTweetDate.getDate() - 1);
      }
      
      if(new DateDiff(now, lastTweetDate).minutes() >= 60) {
        console.log("Tweeted a while ago. Tweeting!");
        Aerbot.set("last_tweet_date", now);
        if(imagePath) {
          this.tweetWithImage(message, imagePath);
        } else {
          this.tweetWithoutImage(message);
        }
        console.log("[[[Tweeted]]] " + message + "(" + imagePath + ")");
      } else {
        console.log("Tweeted too recently. Not tweeting!");
      }
    });
  }

  tweetWithImage(message, imagePath) {
    console.log("TWEETING WITH IMAGE!");
    T.postMediaChunked({ file_path: imagePath }, function (err, data, response) {
      if(!err) {
          console.log(data);
          var mediaIdStr = data.media_id_string;

          var params = { status: message, media_ids: [mediaIdStr] }
          T.post('statuses/update', params, function (err, data, response) {
              console.log(data);
          });
      } else {
          console.error(err);
      }
    });
  }

  tweetWithoutImage(message) {
    console.log("TWEETING WITHOUT IMAGE!");
    var params = { status: message }
    T.post('statuses/update', params, function (err, data, response) {
        console.log(data);
        if(err) {
          console.error(err);
        }
    });
  }

  downloadImage(url, fileName, cb) {
    var file = fs.createWriteStream(fileName);
    var request = https.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);
        });
    });
  }

  v2downloadImage(url, dest, cb) {
    Jimp.read({
        url: url
    })
    .then(image => {
        if(image.bitmap.width > 1920 || image.bitmap.height > 1080) {
            image.scaleToFit(1920,1080);
        }
        image.writeAsync(dest).then(() => cb);
    })
    .catch(err => {
        // Handle an exception.
    });
  }

  async getImage(attachment) {
    const imageLink = attachment.split('.');
    const typeOfImage = imageLink[imageLink.length - 1];
    const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
    if (!image) return '';
    return attachment;
  }
}
  
const instance = new TwitterService();

module.exports = TwitterService