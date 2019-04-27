const GachaDice = require("./gacha/GachaDice.js");
const GachaRPS = require("./gacha/GachaRPS.js");
const Discord = require("discord.js");

/**
 * Service to manage Gacha Game. Threw this together for an event. Need to clean it up.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
var game = new GachaRPS();
var gameInProgress = false;
var entries = new Map();

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
        game.init();
    }

    startGame() {
        this.initializeGame();
        return game.startGame();
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