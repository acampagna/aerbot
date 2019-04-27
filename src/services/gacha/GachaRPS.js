const CoreUtil = require("../../utils/Util.js");
const Discord = require("discord.js");

const rock = "rock";
const paper = "paper";
const scissors = "scissors";
const RPS = [rock, paper, scissors];
var botPicks = {};

class GachaRPS {
    constructor(){
        this.init();
    }

    init() {
        CoreUtil.dateLog("Initialized RPS Game! " + this.generateEntry());
        botPicks = {};
    }

    pickRPS() {
        return RPS[Math.floor(Math.random()*RPS.length)];
    }

    generateEntry() {
        var randomNumber = Math.floor(Math.random() * 100) + 1;
        return {RPS: this.pickRPS(), number: randomNumber};
    }

    didUserWin(userPick, botPick) {
        if(botPick == rock) {
            if(userPick == paper){
                return true;
            }
        } else if(botPick == paper) {
            if(userPick == scissors) {
                return true;
            }
        } else if(botPick == scissors) {
            if(userPick == rock) {
                return true;
            }
        }
        return false;
    }

    startGame() {
        botPicks = this.generateEntry();
        console.log("Bot Picked " + this.entryToString(botPicks));
        return this.startGameMessage();
    }

    entryToString(entry) {
        return "RPS: " + entry.RPS + " Number: " + entry.number;
    }

    endGame(entries) {
        var winnerKey = "";
        var winnerNumber = 10000;
        var winnerValue = {}
        const _this = this;

        console.log("Ending Game!");

        entries.forEach(function(value, key) {
            var RPSPick = value.entry.RPS;
            var numberPick = value.entry.number;

            if(_this.didUserWin(RPSPick,botPicks.RPS)) {
                console.log(key + " Beat Bot with " + RPSPick);
                console.log(key + " picked " + numberPick + " & bot picked " + botPicks.number);
                var numberPickDistance = Math.abs(botPicks.number - numberPick);
                if(numberPickDistance < winnerNumber) {
                    winnerNumber = numberPickDistance;
                    winnerValue = value;
                    winnerKey = key;
                }
            }
            
            if(winnerKey != "") {
                console.log("Winner = " + winnerKey + "(" + _this.entryToString(winnerValue.entry) + ")");
            }
        });

        if(winnerKey != "") {
            return this.endGameMessage(winnerKey, winnerValue.entry);
        } else {
            this.noWinnerMessage();
        }
    }

    startGameMessage() {
        const embed = new Discord.RichEmbed();
		embed.setTitle(`__Gacha! - RPS Game__`);
		embed.setDescription("Gacha Rock, Paper, Scissors Game Started! The player who beats the bot in Rock, Paper, Scissors and guesses a number closest to the bot's wins.");
        embed.setFooter("To enter type !gacha");
        return embed;
    }

    endGameMessage(winnerName, entry) {
        const embed = new Discord.RichEmbed();
		embed.setTitle(`__Gacha! - RPS Game__`);
		embed.setDescription("Bot selected: " + this.entryToString(botPicks) + "\n" + winnerName + " won with " + this.entryToString(entry));
        return embed;
    }

    noWinnerMessage(winnerName, entry) {
        const embed = new Discord.RichEmbed();
		embed.setTitle(`__Gacha! - RPS Game__`);
		embed.setDescription("**NO WINNER!**\nBot selected: " + this.entryToString(botPicks));
        return embed;
    }

    //Service already sends entry as a toString
    entryMessage(entry) {
        const message = "You selected **" + entry + "**";
        return message;
    }
}

module.exports = GachaRPS