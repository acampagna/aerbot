const CoreUtil = require("../utils/Util.js");
const mongoose = require('mongoose');
const Aerbot = mongoose.model('Aerbot');
const DateDiff = require("date-diff");
const Twit = require('twit');

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
              //CoreUtil.aerLog(client,`${member} joined!`);
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
}
  
const instance = new TwitterService();

module.exports = TwitterService