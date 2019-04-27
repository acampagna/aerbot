const CoreUtil = require("../../utils/Util.js");
const Discord = require("discord.js");
const Levenshtein = require('js-levenshtein');

const rock = "rock";
const paper = "paper";
const scissors = "scissors";
const RPS = [rock, paper, scissors];
const maxNumber = 100;
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

    generateEntry(message, params) {
        var numberPick = Math.floor(Math.random() * maxNumber) + 1;
        var RPSPick = this.pickRPS();
        if(params) {
            if(params[0] && isNaN(params[0])) {
                RPSPick = this.detectRPS(params[0]);
            }
            if(params[1] && this.validateNumber(params[1])) {
                numberPick = params[1];
            }
        }
        
        return {RPS: RPSPick, number: numberPick};
    }

    detectRPS(str) {
        if(Levenshtein(str.toLowerCase(), rock) <= 1 || str.toLowerCase() === "r") {
            return rock;
        } else if(Levenshtein(str.toLowerCase(), paper) <= 2 || str.toLowerCase() === "p") {
            return paper;
        } else if(Levenshtein(str.toLowerCase(), scissors) <= 3 || str.toLowerCase() === "s") {
            return scissors;
        } else {
            return this.pickRPS();
        }
    }

    validateNumber(num) {
        if(!isNaN(num) && num >= 0 && num <= maxNumber){
            return true;
        } else {
            return false;
        }
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
        return "RPS: " + entry.RPS.charAt(0).toUpperCase() + entry.RPS.slice(1) + " & Number: " + entry.number;
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
            return this.endGameMessage(winnerKey, winnerValue);
        } else {
            return this.noWinnerMessage();
        }
    }

    startGameMessage() {
        const embed = new Discord.RichEmbed();
		embed.setTitle(`__Gacha! - RPS Game__`);
		embed.setDescription("Gacha Rock, Paper, Scissors Game Started! The player who beats the bot in Rock, Paper, Scissors and guesses a number closest to the bot's wins.\n\n You may select your RPS pick and number while entering the game. Failure to properly select options will give you a random entry.\n\n To enter type !gacha <rock,paper,scissors> <number between 1 and 100>");
        embed.setFooter("Entry Example: !gacha rock 43");
        return embed;
    }

    endGameMessage(winnerName, winnerValue) {
        const embed = new Discord.RichEmbed();
        embed.setTitle(`__Gacha! - RPS Game__`);
        embed.addField("Bot Selected", this.entryToString(botPicks));
        embed.addField("Winner", winnerName + " won with " + this.entryToString(winnerValue.entry));
        console.log(winnerValue.member.user);
        console.log(winnerValue.member.user.avatarURL);
        embed.setThumbnail(winnerValue.member.user.avatarURL);
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