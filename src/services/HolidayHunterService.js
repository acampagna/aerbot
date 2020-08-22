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

 //Spawn more eggs depending on how many people are actively chatting. Scale down exp, currency, and prize probabilities based on # of eggs hidden.
 //Do less time for the event. Or two separate smaller chunks.
 //Give an egg after x amount of time if msg threshold isn't hit
 //Scale premium prizes up or down based on how many have been given and how much time is left
 //Add rotating colors for holidayRole that changes each time a prize or a premium prize is won. Or after x prizes.
 //Holiday achievement should require more eggs found
 //I can add that as a possibility. But what's more likely is we have a "holiday_hunter" achievement that counts ALL events like this that's multi-leveled but the achievement for the specific holiday events is just 1 level.
 
 //More points for discussions outside of public. or less points for discussions in public.
 //Add tax to store for 1 week after event
 //No message credit for consecutive msgs from same person
 //Add grand prize inventory instead of just max of 1

var server = undefined;
var botsChannel;
var publicChannel;
var prizeEmojiId = "698674398252630107";
var prizeEmojiName = "easter_egg";
var sentMessagesMin = 999;
var msgsBetweenPremiumPrize = 999;
var premiumPrizeMax = 0;
var hiddenPrizes = new Array();
var hiddenPrizesLoaded = false;
var holidayRoleId = "698741862751666246";
var canHideEgg = true;

var hideChannels = new Array(
  "620032094009294858",
  "634091411993657357",
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
  "625455049593847838",
  "667569600401244172"
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

  setBotsChannel(channel) {
    botsChannel = channel;
  }

  setPublicChannel(channel) {
    publicChannel = channel;
  }

  messageSent(client) {
    Aerbot.get("messages_since_prize").then(meta => {
      meta.value++;
      console.log(`${meta.key}: ${meta.value}`);
      Aerbot.set("messages_since_prize", meta.value);

      if(meta.value >= sentMessagesMin) {
        const rnd = Math.floor(Math.random() * sentMessagesMin);
        const rndBonus = meta.value - sentMessagesMin;
        const finalRnd = rnd - rndBonus;
        console.log("Message Sent RND: " + rnd + " | RNDBONUS: " + rndBonus + " | FINALRND: " + finalRnd + " | canHideEgg: " + canHideEgg);

        if(canHideEgg && finalRnd <= 0) {
          this.hidePrize(client);
        }
      }
    });
  }

  hidePrize(client) {
    var randomChannel = client.channels.get(this.getRandomPrizeChannel());
    var eggEmoji = client.emojis.get(prizeEmojiId);

    randomChannel.fetchMessages({ limit: 15 }).then(msgs => {
      var randomMessage = msgs.array()[Math.floor(Math.random() * msgs.array().length)];
      randomMessage.react(prizeEmojiId);
      this.addHiddenPrize(randomMessage.id);
      
      publicChannel.send(eggEmoji + eggEmoji + eggEmoji + "\nAerbot has hidden an egg! Find it and maybe win a prize!\n*Eggs can be found in recent messages in a non-group channel.*\n" + eggEmoji + eggEmoji + eggEmoji);
      Aerbot.set("messages_since_prize", "0");
      console.log("HIDING PRIZE - [" + randomChannel.name + "] - " + randomMessage.content);
    });

    const _this = this;
    this.setCanHideEgg(false);
    setTimeout(function() {_this.setCanHideEgg(true);}, 100);
  }

  setCanHideEgg(bool) {
    console.log("canHideEgg: " + canHideEgg);
    canHideEgg = bool;
    console.log("canHideEgg: " + canHideEgg);
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
      var totalEggs = 1;
      member.addRole(message.guild.roles.get(holidayRoleId));

      User.byId(userId).then(user => {
        HandleActivity(client,message.guild,{holiday_hunter: true},user);
        totalEggs = user.getCount("egg_hunter");
        if(totalEggs < 1) {
          totalEggs = 1;
        }
        Aerbot.get("prizes_since_premium").then(meta => {
          meta.value++;
          console.log(`${meta.key}: ${meta.value}`);
  
          if(meta.value >= msgsBetweenPremiumPrize) {
            const rnd = (Math.floor(Math.random() * msgsBetweenPremiumPrize) - (meta.value - msgsBetweenPremiumPrize));
            console.log("Give Prize RND: " + rnd);
  
            if(rnd <= 0) {
              Aerbot.get("total_premium_prizes").then(totalPremiumMeta => {
                totalPremiumMeta.value++;
                console.log(`${totalPremiumMeta.key}: ${totalPremiumMeta.value}`);
                if(totalPremiumMeta.value <= premiumPrizeMax) {
                  this.giveSteamKeyPrize(member, message, totalEggs, client);
                  Aerbot.set("prizes_since_premium", "0");
                  Aerbot.set("total_premium_prizes", totalPremiumMeta.value);
                } else {
                  console.log("MAX PREMIUM PRIZES HIT!");
                  this.giveNormalPrize(member, message, totalEggs, client);
                  Aerbot.set("prizes_since_premium", meta.value);
                }
              });
            } else {
              this.giveNormalPrize(member, message, totalEggs, client);
              Aerbot.set("prizes_since_premium", meta.value);
            }
          } else {
            this.giveNormalPrize(member, message, totalEggs, client);
            Aerbot.set("prizes_since_premium", meta.value);
          }
        });
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

  giveSteamKeyPrize(member, message, totalEggs, client) {
    Prize.giveRandomPrize(0, 999).then(item => {
      console.log("GIVING " + item.name + " TO " + member.displayName);
      Aerbot.set("prizes_since_premium", "0");
      publicChannel.send(member + " found an egg in " + message.channel + " and won " + item.name + " ($" + item.value + ")! " + member + " has found " +  totalEggs + " egg(s).\n\n*DGC Giveaways are paid for by our @🏅Staff and generous donors who have donated on Patreon (<https://www.patreon.com/dauntlessGC>) and PayPal (<https://paypal.me/pools/c/8ocMrMe5tL>). All donations are greatly appreciated. __Thank you so much to all of our donors!__*");
      member.send("Congratz! You found a random steam game in an Easter Egg!\n> Game Name: " + item.name + "\n> Game Value: " + item.value + "\n> Steam Key: " + item.key + "\nhttps://support.steampowered.com/kb_article.php?ref=5414-tfbn-1352");
    });
  }

  giveNormalPrize(member, message, totalEggs, client) {
    console.log("GIVING NORMAL PRIZE TO " + member.displayName);

    var newExp = MemberUtil.calculateActionExp("holiday_hunter");
    var newCurrency = MemberUtil.calculateActionCurrency("holiday_hunter");
    
    publicChannel.send(member + " found an egg in " + message.channel + "! " + member + " has found " +  totalEggs + " egg(s).");
    member.send("Congratz on finding an Easter Egg! You've earned **" + newExp + " exp** and **" + newCurrency + " currency**. Keep hunting for more eggs for a chance to win a random steam game!")
  }
}
  
const instance = new HolidayHunterService();

module.exports = HolidayHunterService