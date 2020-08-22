const CoreUtil = require("../utils/Util.js");
const mongoose = require('mongoose');
const Aerbot = mongoose.model('Aerbot');
const Discord = require("discord.js");
const User = mongoose.model('User');
const MemberUtil = require("../utils/MemberUtil.js");
const StoreItem = mongoose.model('StoreItem');
const StorePurchase = mongoose.model('StorePurchase');
const Validation = require("../utils/ValidationUtil.js");
const Prize = mongoose.model('Prize');
const AchievementService = require("../services/AchievementService");
const Achievement = mongoose.model('Achievement');

/**
 * Service to manage Pinboard. 
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */

server = undefined;
storeChannel = undefined;
HandleActivity = undefined;
pendingRequests = new Map();
colorOptions = Array('AQUA','BLUE','NAVY','GREEN','PURPLE','ORANGE','RED','PINK','LIGHT_GREY','GREY','DARK_GREY','BLACK','RANDOM')

const wait = require('util').promisify(setTimeout);

const AS = new AchievementService();

class StoreService {

  constructor(){
    if(! StoreService.instance){
      this._data = [];
      StoreService.instance = this;
    }

    return StoreService.instance;
  }

  initialize() {

  }

  setStoreChannel(channel) {
    storeChannel = channel;
  }

  setHandleActivity(ha) {
    HandleActivity = ha;
  }

  setClient(client) {
    client = client;
  }

  setServer(server) {
    server = server;
  }

  getPendingRequests() {
    return pendingRequests;
  }

  getUserRequest(userId) {
    return pendingRequests.get(userId);
  }

  userHasPendingRequest(userId) {
    return pendingRequests.has(userId);
  }

  getPossibleColors() {
    return colorOptions.join(", ") + ", or any valid color hex value.";
  }

  setPendingRequest(userId, item, requirement) {
    console.log("SET PENDING REQUEST");
    var _this = this;
    if(!pendingRequests.has(userId)) {
      setTimeout(function() {_this.expirePendingRequest(userId);}, 30000);
    }
    pendingRequests.set(userId, {item: item, requirement: requirement});
  }

  expirePendingRequest(userId) {
    //console.log(this.getPendingRequests());
    console.log("ATTEMPTING REMOVING PENDING REQUEST");
    if(pendingRequests.has(userId)) {
      console.log("REMOVED PENDING REQUEST");
      this.sendRequestExpiredMsg(userId, this.getUserRequest(userId).item);
      pendingRequests.delete(userId);
    }
    //console.log(this.getPendingRequests());
  }

  removePendingRequest(userId) {
    console.log("ATTEMPTING REMOVING PENDING REQUEST");
    if(pendingRequests.has(userId)) {
      console.log("REMOVED PENDING REQUEST");
      pendingRequests.delete(userId);
    }
  }

  async buyProfileColor(dMember, item) {
    console.log(dMember.displayName + " " + item.id + " " + item.answers.get("color"));
    if(item.answers.has("color")) {
      User.findById(dMember.id).then(userData => {
        var price = item.cost;
        //var price = 0;
        console.log(item);
        console.log(userData);
        userData.embedColor = this.getProperColor(item.answers.get("color"));
        userData.currency -= price;
        userData.save();
        StorePurchase.createStorePurchase(userData.id, item.id, price, 1);
        item.purchases++;
        item.save();

				const embed = new Discord.RichEmbed();
				embed.setColor(userData.embedColor);
				embed.setTitle(`__DAUNTLESS STORE - Purchase Success!__`);
        embed.setDescription("You successfully purchased " + item.name + " for Ð" + price + ". Your `!member` profile color is now set to " + userData.embedColor);
        storeChannel.send({embed});
      });
    } else {
      storeChannel.send(dMember + ", there was an error in your purchase of " + item.name + ". You were not charged for this attempted purchase!");
    }
  }

  async buyCustomTitle(dMember, item, client) {
    console.log(dMember.displayName + " " + item.id + " " + item.answers.get("title"));
    if(item.answers.has("title")) {
      User.findById(dMember.id).then(userData => {
        var price = item.cost;
        //var price = 0;
        console.log(item);
        console.log(userData);
        StorePurchase.createStorePurchase(userData.id, item.id, price, 1);
        item.purchases++;
        item.save();

        userData.title = item.answers.get("title");
        userData.currency -= price;
        userData.save().then(u => {
          console.log("FINISHED SAVING USER");
          Achievement.findByName("Entitled").then(achievement => {
            console.log(achievement);

            AS.addAchievement(u, achievement, client, server);
          });

          if(userData.title != item.answers.get("title")) {
            console.log("TITLE WASN'T SET PROPERLY?! IT'S " + userData.title + ". TRYING AGAIN!");
            userData.title = item.answers.get("title");
            userData.save()
          }
        });
        
				const embed = new Discord.RichEmbed();
				embed.setColor(userData.embedColor);
				embed.setTitle(`__DAUNTLESS STORE - Purchase Success!__`);
        embed.setDescription("You successfully purchased " + item.name + " for Ð" + price + ". Your title is now set to " + userData.title + ". *Note: Titles are only used in a few places right now but will be used in more and more places as time goes on.*");
        storeChannel.send({embed});
      });
    } else {
      storeChannel.send(dMember + ", there was an error in your purchase of " + item.name + ". You were not charged for this attempted purchase!");
    }
  }

  async buyExp(dMember, item) {
    console.log(dMember.displayName + " " + item.id) + ": " + item.name;
    User.findById(dMember.id).then(userData => {
      var price = item.cost;
      console.log(item);
      console.log(userData);
      userData.currency -= price;
      userData.exp += item.value;
      userData.save();
      StorePurchase.createStorePurchase(userData.id, item.id, price, 1);

      const embed = new Discord.RichEmbed();
      embed.setColor(userData.embedColor);
      embed.setTitle(`__DAUNTLESS STORE - Purchase Success!__`);
      embed.setDescription("You successfully purchased " + item.name + " for Ð" + price + ". You've gained " + item.value + "EXP!");
      storeChannel.send({embed});
    });
  }

  async buySteamGame(dMember, item, minPrice, maxPrice) {
    console.log(dMember.displayName + " " + item.id) + ": " + item.name;
    User.findById(dMember.id).then(userData => {
      var price = item.cost;
      console.log(item);
      console.log(userData);
      userData.currency -= price;
      userData.save();
      StorePurchase.createStorePurchase(userData.id, item.id, price, 1);

      const embed = new Discord.RichEmbed();
      embed.setColor(userData.embedColor);
      embed.setTitle(`__DAUNTLESS STORE - Purchase Success!__`);

      Prize.giveRandomPrize(minPrice, maxPrice).then(steamGame => {
        console.log(steamGame);
        dMember.send("Congratz on winning a random steam game!\n> Game Name: " + steamGame.name + "\n> Game Value: " + steamGame.value + "\n> Steam Key: " + steamGame.key + "\nhttps://support.steampowered.com/kb_article.php?ref=5414-tfbn-1352");
        embed.setDescription("You successfully purchased **" + steamGame.name + "** ($" + steamGame.value + ") for Ð" + price + ". Check your private messages from Aerbot for your steam key!");
        storeChannel.send({embed});
      });
    });
  }

  async buyMoneybags(dMember, item, client) {
    console.log(dMember.displayName + " " + item.id) + ": " + item.name;
    User.findById(dMember.id).then(userData => {
      var price = item.cost;
      console.log(item);
      console.log(userData);
      userData.currency -= price;
      //userData.save();
      StorePurchase.createStorePurchase(userData.id, item.id, price, 1);

      const embed = new Discord.RichEmbed();
      embed.setColor(userData.embedColor);
      embed.setTitle(`__DAUNTLESS STORE - Purchase Success!__`);

      HandleActivity(client,server,{moneybags: true},userData);
    });
  }

  requestColorMsg(dMember, item) {
    storeChannel.send(dMember + ", please select a color for your purchase of " + item.name + "\nPossible Colors Include: " + this.getPossibleColors());
  }

  requestStringMsg(dMember, item, requirement) {
    storeChannel.send(dMember + ", please specify a **" + requirement + "** for your purchase of " + item.name + ". *Anything inappropriate will be deleted and you'll lose your purchase and more...*");
  }

  sendRequestExpiredMsg(userId, item) {
    storeChannel.send(userId + ", your purchase request for " + item.name + " has expired. You were not charged for this item. Please try again. *(Yes, I know it's using your user id now. Known issue)*");
  }

  getProperColor(color) {
    color = color.toLowerCase();
    if(color === "fff" || color === "#fff" || color === "ffffff" || color === "#ffffff") {
      color = "#eeeeee";
    }

    if(color === "000" || color === "#000" || color === "000000" || color === "#000000") {
      color = "#111111";
    }

    if(color === "pink") {
      color = "LUMINOUS_VIVID_PINK";
    }

    return color.toUpperCase();
  }

  handleRequestResponse(dMessage, client) {
    console.log("handleRequestResponse " + dMessage.content);

    if(dMessage.channel.id === storeChannel.id) {
      var dMember = dMessage.member;
      if(this.userHasPendingRequest(dMember.id)) {
        console.log("MEMBER HAS A PENDING REQUEST!");
        var userRequest = this.getUserRequest(dMember.id);
        console.log(userRequest);
        console.log(this.handleRequirementValidation(dMessage.content, userRequest.item.requirements.get(userRequest.requirement)));
  
        if(userRequest && this.handleRequirementValidation(dMessage.content, userRequest.item.requirements.get(userRequest.requirement))) {
          userRequest.item.answers.set(userRequest.requirement, dMessage.content);
        } else {
          storeChannel.send(dMessage.content + " is an invalid " + userRequest.requirement);
        }
  
        this.handleBuyCommand(dMessage, userRequest.item, client);
        
      } else {
        console.log("MEMBER DOES NOT HAVE A PENDING REQUEST!");
      }
    } else {
      console.log("Message wasn't in store channel!");
    }
  }

  handleSendingRequestMessage(requirement, dMember, item) {
    console.log("handleSendingRequestMessage " + requirement + " " + dMember.displayName + " " + item.name);
    switch(requirement) {
      case "color":
        this.requestColorMsg(dMember, item);
        break;
      case "title":
      case "name":
        this.requestStringMsg(dMember, item, requirement);
        break;
    }
  }

  itemHasRequirementAnswer(item, requirement) {
    console.log(item);
    console.log("item.answers.has(requirement) " + item.answers.has(requirement));
    console.log("item.answers");
    console.log(item.answers);
    return (item.answers.has(requirement) && item.answers.get(requirement) !== "");
  }

  handlePurchase(dMessage, item, client) {
    console.log("handlePurchase " + dMessage.member.displayName + "'s PURCHASE FOR " + item.name);
    switch(item.id) {
      //custom-profile-color
      case "5dd73c6b1415a1462993a60f":
        this.buyProfileColor(dMessage.member, item);
        break;
      //custom-role-1-day
      case "5dd73da61415a1462993a614":
        break;
      //100-exp-boost
      case "5dfdc75738e9f7434ccf5a1b":
        this.buyExp(dMessage.member, item);
        break;
      //Random Steam Game
      case "5e3857ed1bd0fc0b5d2e1e58":
        this.buySteamGame(dMessage.member, item, 0, 14.99);
        break;
      //Random Premium Steam Game
      case "5e38aa7f31b6990da038b66b":
        this.buySteamGame(dMessage.member, item, 9.99, 64.99);
        break;
      //Moneybags Achievement
      case "5e47d4a4c107db7ce82ae8f8":
        this.buyMoneybags(dMessage.member, item, client);
        break;
      //Custom Title
      case "5e9b484cbe2a48540c72b638":
        this.buyCustomTitle(dMessage.member, item, client);
        break;
      default:
        console.log("ITM NOT FOUND!");
    }
  }

  handleBuyCommand(dMessage, item, client) {
    console.log("handleBuyCommand " + item._id);
    var sendRequest;
    var _this = this;
    //item['boomboom'] = 1;
    item.answers = item.answers ? item.answers : new Map();

    //console.log(item);
    if(item.requirements && item.requirements.size > 0 ) {
      console.log("item.requirements.size " + item.requirements.size);
      item.requirements.forEach(function(value, key) {
        console.log("!_this.itemHasRequirementAnswer(item, key)" + !_this.itemHasRequirementAnswer(item, key));
        if(!_this.itemHasRequirementAnswer(item, key)) {
          console.log("sendRequest " + sendRequest);
          if(!sendRequest) {
            sendRequest = key;
          }
        }
      });
    }
    if(sendRequest) {
      this.setPendingRequest(dMessage.member.id, item, sendRequest);
      this.handleSendingRequestMessage(sendRequest, dMessage.member, item);
    } else {
      console.log("SELLING ITEM NOW!");
      this.removePendingRequest(dMessage.member.id);
      this.handlePurchase(dMessage, item, client);
    }
  }

  handleRequirementValidation(str, validation) {
    console.log("handleRequirementValidation " + validation + " " + str);
    switch(validation) {
      case "color":
        console.log("Validation.isHexColor(str) " + Validation.isHexColor(str));
        console.log("colorOptions.includes(str.toUpperCase()) " + colorOptions.includes(str.toUpperCase()));
        return (Validation.isHexColor(str) || colorOptions.includes(str.toUpperCase()));
        break;
      case "string":
      case "name":
      case "title":
        return (str.length > 0 && str.length < 25);
        break;
      default:
        console.log("HIT DEFAULT CASE");
        return false;
    }
  }
}
  
const instance = new StoreService();

module.exports = StoreService