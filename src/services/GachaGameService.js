const GachaDice = require("./gacha/GachaDice.js");
const GachaRPS = require("./gacha/GachaRPS.js");
const GachaBattleRoyale = require("./gacha/GachaBattleRoyale.js");
const GachaPokeRoyale = require("./gacha/GachaPokeRoyale.js");
const Discord = require("discord.js");
const CoreUtil = require("../utils/Util.js");
const mongoose = require('mongoose');
const Activity = mongoose.model('Activity');

/**
 * Service to manage Gacha Game. Threw this together for an event. Need to clean it up.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
var game = new GachaBattleRoyale();
//var game = new GachaRPS();
//var game = new GachaDice();
//var game = new GachaPokeRoyale();
var gameInProgress = false;
var entries = new Map();
var message = undefined;
var mode = "normal";
var userActivity = new Map();
var avgExp = 0;

class GachaGameService {
    constructor(){
     if(! GachaGameService.instance){
       this._data = [];
       GachaGameService.instance = this;
     }
  
     return GachaGameService.instance;
    }

    initializeGame() {
        entries = new Map();
        userActivity = new Map();
        gameInProgress = true;
        message = undefined;
        mode = "normal";
        game.init();
    }

    async startGame(msg, m = "normal") {
        this.initializeGame();

        message = msg;
        mode = m;

        console.log(mode);

        var totalExp = 0;
        var activities = await Activity.findActivitySince(7);

        activities.forEach(activity =>{
            if(activity.type != "achievement") {
                if(userActivity.has(activity.userId)) {
                    userActivity.set(activity.userId, userActivity.get(activity.userId)+activity.exp);
                } else {
                    userActivity.set(activity.userId, activity.exp);
                }
                totalExp += activity.exp;
            }
        });

        avgExp = Math.floor(totalExp/userActivity.size);

        console.log("Total Exp: " + totalExp + " | Total Users: " + userActivity.size + " | Avg Exp: " + avgExp);
        
        return game.startGame(msg, mode);
    }

    getGameInProgress() {
        return gameInProgress;
    }

    hasUserEntered(key) {
        return entries.has(key);
    }

    userEntry(message, params) {
        console.log(this.isUserPremium(message));

        let entry = game.generateEntry(message, params);
        entries.set(message.member.displayName, {member: message.member, entry: entry});
        if(message.member.displayName === "Aerfalle") {
            entries.set("Bot1", {member: {displayName: "Bot1"}, entry: game.generateEntry(message)});
            entries.set("Bot2", {member: {displayName: "Bot2"}, entry: game.generateEntry(message)});
            entries.set("Bot3", {member: {displayName: "Bot3"}, entry: game.generateEntry(message)});
            entries.set("Bot4", {member: {displayName: "Bot4"}, entry: game.generateEntry(message)});
            entries.set("Bot5", {member: {displayName: "Bot5"}, entry: game.generateEntry(message)});
            entries.set("Bot6", {member: {displayName: "Bot6"}, entry: game.generateEntry(message)});
            entries.set("Bot7", {member: {displayName: "Bot7"}, entry: game.generateEntry(message)});
            entries.set("Bot8", {member: {displayName: "Bot8"}, entry: game.generateEntry(message)});
            entries.set("Bot9", {member: {displayName: "Bot9"}, entry: game.generateEntry(message)});
            entries.set("Bot10", {member: {displayName: "Bot10"}, entry: game.generateEntry(message)});
        }
        
        //console.log(member.user);
        //console.log(entries);
        return game.entryMessage(game.entryToString(entry));
    }

    isUserPremium(message) {
        console.log(userActivity.get(message.member.id) + " >= " + avgExp);
        console.log("staff: " + CoreUtil.isMemberStaff(message) + " donor: " + CoreUtil.isMemberDonor(message) + " booster: " + CoreUtil.isMemberNitroBooster(message) + " active: " + (userActivity.get(message.member.id) >= avgExp));
        return (CoreUtil.isMemberStaff(message) || CoreUtil.isMemberDonor(message) || CoreUtil.isMemberNitroBooster(message) || (userActivity.get(message.member.id) >= avgExp));
    }

    endGame() {
        gameInProgress = false;
        return game.endGame(entries);
    }
}
  
const instance = new GachaGameService();

module.exports = GachaGameService