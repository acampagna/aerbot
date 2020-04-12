const CoreUtil = require("../utils/Util.js");
const mongoose = require('mongoose');
const Aerbot = mongoose.model('Aerbot');
const Discord = require("discord.js");
const User = mongoose.model('User');
const MemberUtil = require("../utils/MemberUtil.js");
const DiscordUtil = require("../utils/DiscordUtil.js");
const Validation = require("../utils/ValidationUtil.js");
const MessageQueueItem = mongoose.model('MessageQueueItem');
const Prize = mongoose.model('Prize');
const HandleActivity = require("../HandleActivity");

/**
 * Service to manage Pinboard. 
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */

var server = undefined;
var botsChannel;
var prizeEmojiId = "698674398252630107";
var prizeEmojiName = "easter_egg";
var sentMessagesMin = 20;
var msgsBetweenPremiumPrize = 15;
var premiumPrizeMax = 10;
var hiddenPrizes = new Array();
var hiddenPrizesLoaded = false;
var holidayRoleId = "698741862751666246";

var hideChannels = new Array(
  "633933315094609921",
  "620032094009294858",
  "634091411993657357",
  "579383236334059521",
  "579383236334059521",
  "579383236334059521",
  "579383236334059521",
  "579383236334059521",
  "620268153481461760",
  "643107684421468170",
  "601981031511359518",
  "642979603652018179",
  "655515746046312508",
  "579759668218298398",
  "663317333065859072",
  "659468834599600128",
  "655936144176840735",
  "660538760492089344",
  "629573588143570974",
  "682713472961609797",
  "696023612783853600",
  "689295116648841229",
  "681158773401976862",
  "659468685651476510",
  "668596640520863755",
  "625572707311812609",
  "625454985257418763",
  "625454964084310055",
  "625454999454875649",
  "625455049593847838"
);

const wait = require('util').promisify(setTimeout);

class HolidayHunterService {

  constructor(){
    if(! HolidayHunterService.instance){
      this._data = [];
      HolidayHunterService.instance = this;
    }

    return HolidayHunterService.instance;
  }

  initialize() {
    this.loadHiddenPrizes();
  }

  setServer(s) {
    server = s;
  }

  setBotsChannel(channelId) {
    botsChannel = channelId;
  }

  messageSent(client) {
    Aerbot.get("messages_since_prize").then(meta => {
      console.log(`${meta.key}: ${meta.value}`);
      meta.value++;
      Aerbot.set("messages_since_prize", meta.value);
      console.log(`increased value to ${meta.value}`);

      if(meta.value >= sentMessagesMin) {
        const rnd = (Math.floor(Math.random() * 5) - (meta.value - sentMessagesMin));
        console.log("Message Sent RND: " + rnd);

        if(rnd <= 0) {
          this.hidePrize(client);
        }
      }
    });
  }

  hidePrize(client) {
    var randomChannel = client.channels.get(this.getRandomPrizeChannel());

    randomChannel.fetchMessages({ limit: 10 }).then(msgs => {
      var randomMessage = msgs.array()[Math.floor(Math.random() * msgs.array().length)];
      randomMessage.react(prizeEmojiId);
      this.addHiddenPrize(randomMessage.id);
      botsChannel.send("Aerbot has hidden an egg! Find it (in a recent message in a non-group channel) and maybe win a prize!");
      Aerbot.set("messages_since_prize", "0");
      console.log("HIDING PRIZE - " + randomChannel.name + " - " + randomMessage.content);
    });
  }

  getRandomPrizeChannel() {
    return hideChannels[Math.floor(Math.random() * hideChannels.length)];
  }

  prizeFound(message, userId, client) {
    if(this.getHiddenPrizes().includes(message.id)) {
      console.log("PRIZE FOUND!");
      this.removeHiddenPrize(message.id);
      this.givePrize(message, userId, client);
    } else {
      console.log("FAKE PRIZE!");
    }

    var messageReaction = message.reactions.get(this.getPrizeKey());
    messageReaction.remove();
    messageReaction.remove(userId);
  }

  givePrize(message, userId, client) {
    if(message.guild) {
      var member = message.guild.members.get(userId);
      member.addRole(message.guild.roles.get(holidayRoleId));

      User.byId(userId).then(user => {
        HandleActivity(client,message.guild,{holiday_hunter: true},user);
      });

      Aerbot.get("prizes_since_premium").then(meta => {
        console.log(`${meta.key}: ${meta.value}`);
        meta.value++;

        if(meta.value >= msgsBetweenPremiumPrize) {
          const rnd = (Math.floor(Math.random() * 5) - (meta.value - msgsBetweenPremiumPrize));
          console.log("Give Prize RND: " + rnd);

          if(rnd <= 0) {
            Aerbot.get("total_premium_prizes").then(totalPremiumMeta => {
              console.log(`${totalPremiumMeta.key}: ${totalPremiumMeta.value}`);
              totalPremiumMeta.value++;
              if(totalPremiumMeta.value <= premiumPrizeMax) {
                this.giveSteamKeyPrize(member, client);
                Aerbot.set("prizes_since_premium", "0");
                Aerbot.set("total_premium_prizes", totalPremiumMeta.value);
              } else {
                console.log("MAX PREMIUM PRIZES HIT!");
                this.giveNormalPrize(member, client);
                Aerbot.set("prizes_since_premium", meta.value);
              }
            });
          } else {
            this.giveNormalPrize(member, client);
            Aerbot.set("prizes_since_premium", meta.value);
          }
        } else {
          this.giveNormalPrize(member, client);
          Aerbot.set("prizes_since_premium", meta.value);
        }
      });
    }
  }

  getHiddenPrizes() {
    if(!hiddenPrizesLoaded) {
      return this.loadHiddenPrizes();
    } else {
      return hiddenPrizes;
    }
  }

  loadHiddenPrizes() {
    Aerbot.get("hidden_prizes").then(meta => {
      if(meta.value.length > 0)
        hiddenPrizes = meta.value.split(",");
      hiddenPrizesLoaded = true;
      return hiddenPrizes;
    });
  }

  saveHiddenPrizes() {
    Aerbot.set("hidden_prizes", hiddenPrizes.join());
  }

  addHiddenPrize(messageId) {
    hiddenPrizes.push(messageId);
    this.saveHiddenPrizes();
    //console.log(hiddenPrizes);
  }

  removeHiddenPrize(messageId) {
    //console.log(hiddenPrizes);
    const index = hiddenPrizes.indexOf(messageId);
    if (index > -1) {
      hiddenPrizes.splice(index, 1);
      this.saveHiddenPrizes();
    }
    //console.log(hiddenPrizes);
  }

  getPrizeEmojiId() {
    return prizeEmojiId;
  }

  getPrizeKey() {
    return (`${prizeEmojiName}:${prizeEmojiId}`);
  }

  giveSteamKeyPrize(member, client) {
    Prize.giveRandomPrize(0, 999).then(item => {
      console.log("GIVING " + item.name + " TO " + member.displayName);
      Aerbot.set("prizes_since_premium", "0");
      botsChannel.send(member + " found an egg and won " + item.name + " ($" + item.value + ")! *Check your private messages from Aerbot for your steam key!*");
      member.send("Congratz! You found a random steam game in an Easter Egg!\n> Game Name: " + item.name + "\n> Game Value: " + item.value + "\n> Steam Key: " + item.key + "\nhttps://support.steampowered.com/kb_article.php?ref=5414-tfbn-1352");
    });
  }

  giveNormalPrize(member, client) {
    console.log("GIVING NORMAL PRIZE TO " + member.displayName);

    var newExp = MemberUtil.calculateActionExp("holiday_hunter");
    var newCurrency = MemberUtil.calculateActionCurrency("holiday_hunter");
    
    botsChannel.send(member + " found an egg!");
    member.send("Congratz on finding an Easter Egg! You've earned **" + newExp + " exp** and **" + newCurrency + " currency**. Keep hunting for more eggs for a chance to win a random steam game!")
  }
}
  
const instance = new HolidayHunterService();

module.exports = HolidayHunterService