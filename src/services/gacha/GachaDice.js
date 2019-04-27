const CoreUtil = require("../../utils/Util.js");
const Discord = require("discord.js");

const gameName = "Dice";

class GachaDice {
    constructor(){
        this.init();
    }

    init() {
        CoreUtil.dateLog("Initialized DICE Game! " + this.generateEntry());
    }

    generateEntry(message) {
        let roll = this.rollDice();
        return roll;
    }

    rollDice() {
        return Math.floor(Math.random() * 100) + 1;
    }

    startGame() {
        return this.startGameMessage();
    }

    entryToString(entry) {
        return entry;
    }

    endGame(entries) {
        var winnerKey = "";
        var winnerValue = {};
        var winnerRoll = 0;
        console.log("Ending Game!");
        entries.forEach(function(value, key) {
            var roll = value.entry;
            //console.log(key + " rolled a " + roll);
            if(roll > winnerRoll) {
                winnerRoll = roll;
                winnerKey = key;
                winnerValue = value;
            }
            console.log("Winner = " + winnerKey + "(" + winnerRoll + ")");
        });

        return this.endGameMessage(winnerKey, winnerValue);
    }

    startGameMessage() {
        const embed = new Discord.RichEmbed();
		embed.setTitle(`__Gacha! - Dice Game__`);
		embed.setDescription("Gacha Game Started! Roll the dice and win a prize. Highest roll in 1 minute wins!\n\n To enter type !gacha");
        embed.setFooter("Entry Example: !gacha");
        return embed;
    }

    endGameMessage(winnerName, winnerValue) {
        const embed = new Discord.RichEmbed();
		embed.setTitle(`__Gacha! - Dice Game__`);
        embed.setDescription(winnerName + " won with a roll of " + winnerValue.entry);
        embed.setThumbnail(winnerValue.member.user.avatarURL);
        return embed;
    }

    //Service already sends entry as a toString
    entryMessage(roll) {
        const message = "You rolled a **" + roll + "**";
        return message;
    }
}

module.exports = GachaDice