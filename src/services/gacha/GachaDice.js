const CoreUtil = require("../../utils/Util.js");
const Discord = require("discord.js");

class GachaDice {
    constructor(){
        this.init();
    }

    init() {
        CoreUtil.dateLog("Initialized DICE Game! " + this.rollDice());
    }

    generateEntry(message) {
        let roll = this.rollDice();
        return roll;
    }

    rollDice() {
        var randomNumber = Math.floor(Math.random() * 100) + 1;
        return randomNumber;
    }

    startGame() {
        return this.startGameMessage();
    }

    entryToString(entry) {
        return entry;
    }

    endGame(entries) {
        var winnerKey = "";
        var winnerValue = 0;
        console.log("Ending Game!");
        entries.forEach(function(value, key) {
            var roll = value.entry;
            //console.log(key + " rolled a " + roll);
            if(roll > winnerValue) {
                winnerValue = roll;
                winnerKey = key;
            }
            console.log("Winner = " + winnerKey + "(" + winnerValue + ")");
        });

        return this.endGameMessage(winnerKey, winnerValue);
    }

    startGameMessage() {
        const embed = new Discord.RichEmbed();
		embed.setTitle(`__Gacha! - Dice Game__`);
		embed.setDescription("Gacha Game Started! Roll the dice and win a prize. Highest roll in 1 minute wins!");
        embed.setFooter("To enter type !gacha");
        return embed;
    }

    endGameMessage(winnerName, winnerValue) {
        const embed = new Discord.RichEmbed();
		embed.setTitle(`__Gacha! - Dice Game__`);
		embed.setDescription(winnerName + " won with a roll of " + winnerValue);
        return embed;
    }

    //Service already sends entry as a toString
    entryMessage(roll) {
        const message = "You rolled a **" + roll + "**";
        return message;
    }
}

module.exports = GachaDice