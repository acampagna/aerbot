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
			return Promise.resolve({everyone: true, message: ggs.endGame() })
		}
		//Game is in progress. Play the game
		let username = message.member.displayName;
		if(ggs.hasUserEntered(username)) {
			return Promise.resolve("You've already entered!");
		} else {
			return Promise.resolve(ggs.userEntry(message));
		}
	} else {
		//Game is not in progress. Need to start a game or yell if the user isn't an admin.
		if(CoreUtil.isMemberAdmin(message, guildData)) {
			return Promise.resolve({everyone: true, message: ggs.startGame() });
		} else {
			return Promise.resolve("Gacha Game is not currently active");
		}
	}
}