const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const GachaGameService = require("../services/GachaGameService");
const Discord = require("discord.js");

module.exports = new Command({
	name: "gacha",
	description: "Play Gacha Game!",
	syntax: "gacha",
	admin: false,
	invoke
});

const ggs = new GachaGameService();

/**
 * Gacha game! Threw this together for an event. Need to clean it up.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, guildData, client }) {
	if(ggs.getGameInProgress()) {
		if(CoreUtil.isMemberAdmin(message, guildData) && params[0] === "end") {
			let winner = ggs.endGame();
			const embed = new Discord.RichEmbed();
			embed.setTitle(`__Gacha!__`);
			embed.setDescription(winner);
			return Promise.resolve({everyone: true, message: embed })
		}
		//Game is in progress. Play the game
		let username = message.member.displayName;
		if(ggs.hasUserEntered(username)) {
			return Promise.resolve("You've already entered!");
		} else {
			let roll = ggs.userEntry(username);
			return Promise.resolve("You rolled a " + roll);
		}
	} else {
		//Game is not in progress. Need to start a game or yell if the user isn't an admin.
		if(CoreUtil.isMemberAdmin(message, guildData)) {
			ggs.startGame();
			const embed = new Discord.RichEmbed();
			embed.setTitle(`__Gacha!__`);
			embed.setDescription("Gacha Game Started! Roll the dice and win a prize. Highest roll in 1 minute wins!");
			embed.setFooter("To enter type !gacha");
			return Promise.resolve({everyone: true, message: embed });
		} else {
			return Promise.resolve("Gacha Game is not currently active");
		}
	}
}