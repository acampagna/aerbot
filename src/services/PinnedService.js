const CoreUtil = require("../utils/Util.js");
const mongoose = require('mongoose');
const Aerbot = mongoose.model('Aerbot');
const Pinned = mongoose.model('Pinned');
const Discord = require("discord.js");
const HandleActivity = require("../HandleActivity");
const UserModel = mongoose.model('User');
const Twit = require('twit');
const https = require('https');
const fs = require('fs');
const TwitterService = require("./TwitterService");
var Jimp = require('jimp');


/**
 * Service to manage Pinboard. 
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */

const ignoredCategories = new Array(
    "551939844280942610", //ADMIN
    "634617182122147840", //HIDDEN
    "630030213924782080", //PARTNERSHIPS
    "625572138736287744", //EXPLICIT CONTENT
    "585689139391889408", //DURANGO PROFESSIONS
    "578990224604921887", //DURANGO
    "634067492150444032", //INFORMATION
    "633329100664209441", //WELCOME
    "633932629066121237", //COUNCIL
    "629778070982885377", //STAFF
    "637734526780571666", //BDM
    "658537544740241409" //CONTENT CREATORS
);
const ignoredCategoriesChannelWhitelist = new Array(
    "634091411993657357" //game-deals
);
const ignoredChannels = new Array(
    "643107684421468170", //pinboard
    "645648131433955358", //minecraft-server
    "626677437287366666", //music-playlist
    "630032620331335690", //idle-miner
    "628947427466149888", //pokecord
    "579759668218298398", //introductions
    "667697726766710794", //discord-dungeons
    "659468834599600128" //streams-and-videos
);
const starboardEmojiId = "538050181573378048";
const starboardChannelId = "643107684421468170";

const pinReactionsRequired = 3;

const TWITTER_SERVICE = new TwitterService();

class PinnedService {
    constructor(){
     if(! PinnedService.instance){
       this._data = [];
       PinnedService.instance = this;
     }
  
     return PinnedService.instance;
    }

    initialize() {
        currentTriviaId = Math.floor(Date.now() / 1000);
	    currentQuestion = 0;
	    Aerbot.set("currentTriviaId", currentTriviaId);
    }

    async analyzeRawEvent(client, rawData, channel, message) {
        if(rawData.emoji.id && rawData.emoji.id === starboardEmojiId) {
            var logStr = "Dauntless Emoji Used. ";

            console.log(channel.parentID);

            if(!ignoredChannels.includes(channel.id) && !ignoredCategories.includes(channel.parentID)) {
                logStr += "Channel and Category are not ignored. ";
                var reactions = message.reactions;
                var pinReactionCount = 0;

                reactions.forEach(function(value, key) {
                    if(value.emoji.id === starboardEmojiId) {
                        pinReactionCount = value.count;
                        logStr += "Message has " + value.count + " pin reactions. ";
                    }
                });

                if(pinReactionCount >= pinReactionsRequired) {

                    logStr += "Message has enough pin reactions. ";
                    var pinboardChannel = client.channels.get(starboardChannelId);
                    const fetchedMessages = await pinboardChannel.fetchMessages({ limit: 100 });
                    const existingMsg = fetchedMessages.find(m => m.embeds[0] ? m.embeds[0].footer.text === message.id : false);
                    var emoji = client.emojis.get(starboardEmojiId);
                    var msgText = emoji + " **" + pinReactionCount + "** " + channel;
                    const image = message.attachments.size > 0 ? await this.getImage(message.attachments.array()[0].url) : '';

                    if(existingMsg) {
                        logStr += "Updated Message! ";
                            
                        const embed = new Discord.RichEmbed()
                        .setColor(15844367)
                        .setDescription(message.cleanContent)
                        .setAuthor(message.member.displayName, message.author.displayAvatarURL)
                        .setTimestamp()
                        .setFooter(message.id)
                        .setImage(image)

                        await existingMsg.edit(msgText, { embed });
                    } else {
                        if (image !== '' || message.cleanContent.length > 0) {
                            logStr += "Pinned Message! ";

                            UserModel.byId(message.member.id).then(user => {
                                var server = client.guilds.get(message.guild.id);
                                HandleActivity(client,server,{pinned: true},user);
                            });
                            
                            const embed = new Discord.RichEmbed()
                            .setColor(15844367)
                            .setDescription(message.cleanContent)
                            .setAuthor(message.member.displayName, message.author.displayAvatarURL)
                            .setTimestamp(new Date())
                            .setFooter(message.id)
                            .setImage(image)
    
                            await pinboardChannel.send(msgText, { embed });

                            if(image && image !== '') {
                                this.download(image, 'res/tmp/' + message.attachments.array()[0].filename, this.tweet(message.member.displayName + "'s picture was pinned: " + message.cleanContent, 'res/tmp/' + message.attachments.array()[0].filename));
                            } else {
                                //TWITTER_SERVICE.tweet(message.member.displayName + "'s message was pinned: " + message.cleanContent);
                            }
                        }
                    }
                }
            } else {
                logStr += "Channel or Category is ignored. ";
            }

            console.log(logStr);
        }
    }

    async getImage(attachment) {
        const imageLink = attachment.split('.');
        const typeOfImage = imageLink[imageLink.length - 1];
        const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
        if (!image) return '';
        return attachment;
      }
    
    download(url, dest, cb) {
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

    tweet(message, file) {
        setTimeout(function(){  
            TWITTER_SERVICE.tweet(message, file)
        }, 5000)
    }
}
  
const instance = new PinnedService();

module.exports = PinnedService