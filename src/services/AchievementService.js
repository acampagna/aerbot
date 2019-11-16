const CoreUtil = require("../utils/Util.js");
const mongoose = require('mongoose');
const Aerbot = mongoose.model('Aerbot');
const Discord = require("discord.js");
//const HandleActivity = require("../HandleActivity");
const Achievements = mongoose.model('Achievement');
const UserModel = mongoose.model('User');
//const MemberUtil = require("./utils/MemberUtil.js");

/**
 * Service to manage Pinboard. 
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */

achievementChannel = undefined;
HandleActivity = undefined;

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
    var achievement = await Achievements.findByName(name);

    if(achievement) {
      this.addAchievement(user, achievement, client, server);
    }
  }

  async addAchievement(user, achievement, client, server) {
    var emoji = this.determineEmoji(achievement, client);
    var niceName = emoji + " " + achievement.name;

    var achievements = user.getAchievements();

    if(!achievements.includes(achievement.id)) {
      console.log("Adding " + niceName + " to " + user.username);
      console.log(user.username + " Currency: " + (10 + achievement.currencyBonus) + " EXP: " + (50 + achievement.expBonus));
      
      if(achievement.name != "TEST"){
        achievements.push(achievement.id);
      }

      user.achievements = achievements;
      user.currency += 10 + achievement.currencyBonus;
  
      await HandleActivity(client,server,{achievement: achievement.expBonus},user);
  
      if(achievement.name != "TEST"){
        achievementChannel.send(user.username + " has unlocked the " + niceName + " achievement!");
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

      var achievements = user.getAchievements();

      if(!achievements.includes(achievement.id)) {
        console.log("Adding " + niceName + " to " + user.username);
        console.log(user.username + " Currency: " + (10 + achievement.currencyBonus) + " EXP: " + (50 + achievement.expBonus));

        achievements.push(achievement.id);

        user.achievements = achievements;
        user.currency += 10 + achievement.currencyBonus;
    
        console.log("WOULD HAVE SENT: " + user.username + " has unlocked the " + niceName + " achievement!")
        achievementChannel.send(user.username + " has unlocked the " + niceName + " achievement!");
      } else {
        console.log(user.username + " already has " + niceName);
      }
      resolve(user);
    });
  }

  determineEmoji(achievement, client) {
    if(achievement.emoji.length > 5) {
      return client.emojis.get(achievement.emoji);
    } else {
      return achievement.emoji;
    }
  }
}
  
const instance = new AchievementsService();

module.exports = AchievementsService