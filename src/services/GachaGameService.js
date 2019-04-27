const GachaDice = require("./gacha/GachaDice.js");
const GachaRPS = require("./gacha/GachaRPS.js");
const GachaBattleRoyale = require("./gacha/GachaBattleRoyale.js");
const Discord = require("discord.js");

/**
 * Service to manage Gacha Game. Threw this together for an event. Need to clean it up.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
//var game = new GachaBattleRoyale();
//var game = new GachaRPS();
var game = new GachaDice();
var gameInProgress = false;
var entries = new Map();
var message = undefined;

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
        gameInProgress = true;
        message = undefined;
        game.init();
    }

    startGame(msg) {
        this.initializeGame();

        message = msg;
        
        return game.startGame(msg);
    }

    getGameInProgress() {
        return gameInProgress;
    }

    hasUserEntered(key) {
        return entries.has(key);
    }

    userEntry(message, params) {
        let entry = game.generateEntry(message, params);
        entries.set(message.member.displayName, {member: message.member, entry: entry});
        if(message.member.displayName === "Aerfalle") {
            entries.set("Bot1", {member: {displayName: "Bot1"}, entry: game.generateEntry(message, params)});
            entries.set("Bot2", {member: {displayName: "Bot2"}, entry: game.generateEntry(message, params)});
            entries.set("Bot3", {member: {displayName: "Bot3"}, entry: game.generateEntry(message, params)});
            entries.set("Bot4", {member: {displayName: "Bot4"}, entry: game.generateEntry(message, params)});
            entries.set("Bot5", {member: {displayName: "Bot5"}, entry: game.generateEntry(message, params)});
            entries.set("Bot6", {member: {displayName: "Bot6"}, entry: game.generateEntry(message, params)});
            entries.set("Bot7", {member: {displayName: "Bot7"}, entry: game.generateEntry(message, params)});
            entries.set("Bot8", {member: {displayName: "Bot8"}, entry: game.generateEntry(message, params)});
            entries.set("Bot9", {member: {displayName: "Bot9"}, entry: game.generateEntry(message, params)});
            entries.set("Bot10", {member: {displayName: "Bot10"}, entry: game.generateEntry(message, params)});
        }
        
        //console.log(member.user);
        //console.log(entries);
        return game.entryMessage(game.entryToString(entry));
    }

    endGame() {
        gameInProgress = false;
        return game.endGame(entries);
    }
}
  
const instance = new GachaGameService();

module.exports = GachaGameService