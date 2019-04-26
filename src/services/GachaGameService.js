const GachaDice = require("./gacha/GachaDice.js");
const GachaRPS = require("../services/gacha/GachaRPS.js");
/**
 * Service to manage Gacha Game. Threw this together for an event. Need to clean it up.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
var game = GachaDice;
var gameInProgress = false;
var entries = new Map();

var newEntry = {
    member: {},
    entry: undefined
}

class GachaGameService {
    constructor(){
     if(! GachaGameService.instance){
       this._data = [];
       GachaGameService.instance = this;
     }
  
     return GachaGameService.instance;
    }

    initializeGame() {
        gameInProgress = false;
        entries = new Map();
        //game.init();
    }

    startGame() {
        this.initializeGame();
        gameInProgress = true;
    }

    endGame() {
        gameInProgress = false;
    }

    getGameInProgress() {
        return gameInProgress;
    }

    hasUserEntered(key) {
        return entries.has(key);
    }

    userEntry(member) {
        let roll = this.rollDice();
        entries.set(member, roll);
        console.log(entries);
        return roll;
    }

    //Ends the game. there are way better ways to do this. Will worry about that when I rewrite the whole feature.
    endGame() {
        var winnerKey = "";
        var winnerValue = 0;
        entries.forEach(function(value, key) {
            if(value > winnerValue) {
                winnerValue = value;
                winnerKey = key;
            }
        });
        this.initializeGame();
        return winnerKey + " won with a roll of " + winnerValue;
    }

    rollDice() {
        var randomNumber = Math.floor(Math.random() * 100) + 1;
        return randomNumber;
    }
}
  
const instance = new GachaGameService();

module.exports = GachaGameService