const CoreUtil = require("../utils/Util.js");
const mongoose = require('mongoose');
const Aerbot = mongoose.model('Aerbot');
const Discord = require("discord.js");
//const HandleActivity = require("../HandleActivity");
const Achievements = mongoose.model('Achievement');
const UserModel = mongoose.model('User');
const MemberUtil = require("../utils/MemberUtil.js");

/**
 * Service to manage Pinboard. 
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */

achievementChannel = undefined;
HandleActivity = undefined;
rankEmojis = Array("one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "keycap_ten");

class AchievementsService {

  //achievementChannel = undefined;
  //client = undefined;
  //server = undefined;

  constructor(){
    if(! AchievementsService.instance){
      this._data = [];
      AchievementsService.instance = this;
    }

    return AchievementsService.instance;
  }

  initialize() {

  }

  setAchievementChannel(channel) {
    achievementChannel = channel;
  }

  setHandleActivity(ha) {
    HandleActivity = ha;
  }

  setClient(client) {
    this.client = client;
  }

  setServer(server) {
    this.server = server;
  }

  initAddAchievement(channel, client, server) {
    this.setAchievementChannel = channel;
    this.setClient = client;
    this.setServer = server;
  }

  async addAchievementByName(user, name, client, server) {
    console.log("Adding Achievement By Name!");
    var achievement = await Achievements.findByName(name);

    if(achievement) {
      this.addAchievement(user, achievement, client, server);
    }
  }

  async addAchievement(user, achievement, client, server) {
    var emoji = this.determineEmoji(achievement, client);
    var niceName = emoji + " " + achievement.name;

    var achievements = user.getAchievements();
    var badges = user.getBadges();

    if(!badges.has(achievement.id)) {
      console.log("Adding " + niceName + " to " + user.username);

      var newExp = Math.round((MemberUtil.calculateActionExp("achievement") + achievement.expBonus));
			var newCurrency = Math.round((MemberUtil.calculateActionCurrency("achievement") + achievement.currencyBonus));
      
      if(achievement.name != "TEST"){
        badges.set(achievement.id, 0);
      }

      user.badges = badges;
  
      await HandleActivity(client,server,{achievement: {exp: newExp, currency: newCurrency}},user);
  
      if(achievement.name != "TEST"){
        var member = client.guilds.get("524900292836458497").members.get(user.id);
        achievementChannel.send(this.createEmbed(member + " has unlocked the **" + niceName + "** achievement because they " + achievement.description + "!", newExp, newCurrency));
      }
    } else {
      console.log(user.username + " already has " + niceName);
    }
  }

  addAchievementFromActivity(user, achievement, client, server) {
    var _this = this;
    return new Promise(async function(resolve, reject) {
      var emoji = _this.determineEmoji(achievement, client);
      var niceName = emoji + " " + achievement.name;

      var badges = user.getBadges();

      if(!badges.has(achievement.id)) {
        console.log("Adding " + niceName + " to " + user.username);

        var newExp = Math.round((MemberUtil.calculateActionExp("achievement") + achievement.expBonus));
				var newCurrency = Math.round((MemberUtil.calculateActionCurrency("achievement") + achievement.currencyBonus));

        badges.set(achievement.id, 0);

        user.badges = badges;

        var member = client.guilds.get("524900292836458497").members.get(user.id);
        achievementChannel.send(_this.createEmbed(member + " has unlocked the **" + niceName + "** achievement because they " + achievement.description + "!", newExp, newCurrency));
      } else {
        console.log(user.username + " already has " + niceName);
      }
      resolve(user);
    });
  }

  processRankedAchievementActivity(user, achievement, client, server, rankValue) {
    var _this = this;
    return new Promise(async function(resolve, reject) {
      var emoji = _this.determineEmoji(achievement, client);
      var niceName = emoji + " " + achievement.name;

      var badges = user.getBadges();
      var achievementRank = _this.determineAchievementRank(achievement, rankValue);
      var currentRank = -1;
      var upgrade = false;

      if(badges.has(achievement.id)) {
        //I already have badge. Do I need to upgrade?
        currentRank = badges.get(achievement.id);
        //console.log("achievementRank = " + achievementRank + " | currentRank = " + currentRank + " | " + (achievementRank > currentRank));
        if(achievementRank > currentRank) {
          upgrade = true;
        }
      }

      var rankDifference = (achievementRank - currentRank);

      if(rankDifference > 0) {
        var member = client.guilds.get("524900292836458497").members.get(user.id);
        var newExpBase = Math.round((MemberUtil.calculateActionExp("achievement") + achievement.expBonus));
        var newCurrencyBase = Math.round((MemberUtil.calculateActionCurrency("achievement") + achievement.currencyBonus));
        var rankExpBonus = Math.round(achievement.rankExpFactor * (achievementRank));

        //console.log("RANK DIFFERENCE = " + rankDifference + " | RANK EXP BONUS = " + rankExpBonus);
        //console.log(newCurrencyBase + " * " + rankDifference + " = " + (newCurrencyBase * rankDifference) + " + " + (rankExpBonus/20) + " = " +  ((newCurrencyBase * (rankDifference)) + (rankExpBonus/20)));

        badges.set(achievement.id, achievementRank);
        user.badges = badges;

        var embed = _this.createEmbed(member + " has unlocked Rank " + (achievementRank+1) + " of the **" + niceName + "** achievement because they " + _this.getAchievementDescription(achievement, achievement.ranks[achievementRank]) + "!", Math.round((newExpBase * rankDifference) + rankExpBonus), Math.round((newCurrencyBase * rankDifference) + (rankExpBonus/20)));

        if(rankDifference > 1) {
          embed.setFooter("Backpay for previous " + (rankDifference-1) + " missed ranks is included!");
        }

        console.log(user.username + " has unlocked Rank " + (achievementRank+1) + " of the " + niceName + " achievement! | " + Math.round(((newExpBase * (rankDifference)) + rankExpBonus)) + " | " + Math.round(((newCurrencyBase * (rankDifference)) + (rankExpBonus/20))));
        achievementChannel.send(embed);
      }
      //console.log({exp: Math.round(((newExpBase * (rankDifference)) + rankExpBonus)), currency: Math.round(((newCurrencyBase * (rankDifference)) + (rankExpBonus/20)))});
      resolve({exp: Math.round(((newExpBase * (rankDifference)) + rankExpBonus)), currency: Math.round(((newCurrencyBase * (rankDifference)) + (rankExpBonus/20)))});
    });
  }

  getAchievementDescription(achievement, number){
    number = number ? number : "x number of";
    return achievement.description.split("{$n}").join(number);
  }

  getAchievementNiceName(achievement, client, rankNumber) {
    var emoji = this.determineEmoji(achievement, client);
    if(rankNumber) {
      return emoji + ":" + rankEmojis[rankNumber-1] + ": " + achievement.name;
    } else {
      return emoji + " " + achievement.name;
    }
  }

  getAchievementNiceDescription(achievement, client, rankValue, rankNumber){
    var emoji = this.determineEmoji(achievement, client);
    
    if(achievement.ranks.length > 0 && rankNumber && rankValue) {
      return emoji + ":" + rankEmojis[rankNumber] + ": " + achievement.name + " - " + this.getAchievementDescription(achievement, rankValue) + "\n";
    } else if(rankValue) {
      return emoji + " " + achievement.name + " - " + this.getAchievementDescription(achievement, rankValue) + "\n";
    } else {
      return emoji + " " + achievement.name + " - " + this.getAchievementDescription(achievement) + "\n";
    }
  }

  determineAchievementRank(achievement, value) {
    var minQualifiedRankValue = -1;
    //var minQualifiedRankPos = 0;

    if(achievement.ranks.length > 0) {
      achievement.ranks.forEach(r => {
        if(r <= value) {
          minQualifiedRankValue = r;
        }
      });

      //console.log("----");
      //console.log("Value: " + value);
      //console.log(achievement.ranks.indexOf(minQualifiedRankValue));
      //console.log(minQualifiedRankValue);
      //console.log("----");

      return achievement.ranks.indexOf(minQualifiedRankValue);
    } else {
      return 0;
    }
    
  }

  createEmbed(desc, exp, currency) {
    const embed = new Discord.RichEmbed();
    embed.setTitle("Achievement Unlocked");
    embed.setColor("RANDOM");
    embed.setDescription(desc);
    embed.addField("EXP Gained", Math.max(exp, 0), true);
    embed.addField("Ð (Currency) Gained", Math.max(currency,0), true);
    return embed;
  }

  determineEmoji(achievement, client) {
    if(achievement.emoji && achievement.emoji.length > 5) {
      return client.emojis.get(achievement.emoji);
    } else {
      return achievement.emoji;
    }
  }
}
  
const instance = new AchievementsService();

module.exports = AchievementsService