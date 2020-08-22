const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const Discord = require("discord.js");
const DiscordUtil = require("../utils/DiscordUtil.js");

module.exports = new Command({
	name: "playing",
	description: "Who's playing what game",
	syntax: "playing",
	admin: false,
	invoke
});

/**
 * Sets and displays accounts for a member. Currently we use a single default for setting and displaying.
 * UNFINISHED. NEEDS CLEANUP. NEEDS TO BE FINISHED.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, serverData, client }) {
	//if (message.mentions.members.size > 0) {
		var gameName = params.join(" ").toLowerCase().trim();
		var members = Array();
		var nameMentions = "";

		const embed = new Discord.RichEmbed();
		embed.setColor("RANDOM");
		embed.setTitle("Members are currently playing **" + gameName + "**");

		if(gameName && gameName != "") {
			message.guild.members.forEach(member => {
				if(member.presence.game) {
					if(member.presence.game.name.toLowerCase() == gameName) {
						members.push(member);
						nameMentions += "**" + member + "**  ";
					}
				}
			});

			embed.setDescription(nameMentions);
			return Promise.resolve(DiscordUtil.processEmbed(embed, client));
			//return Promise.resolve("The following members are currently playing *" + gameName + "*: " +  nameMentions);
		} else {
			//return new Promise(function(resolve, reject) {
				var gamesPlayed = new Map();

				message.guild.members.forEach(member => {
					if(member.presence.game && member.presence.game.name && member.presence.game.applicationID) {
						var game = member.presence.game.name;
						if(CoreUtil.isMemberAerfalle(message.member)) {
							game = game + " (" + member.presence.game.applicationID + ")";
						}
						
						//console.log(member.presence.game);

						if(gamesPlayed.has(game)) {
							gamesPlayed.set(game,gamesPlayed.get(game)+1);
						} else {
							gamesPlayed.set(game,1);
						}
					}
				});

				//console.log(gamesPlayed);
				var sortedGamesPlayed = new Map([...gamesPlayed.entries()].sort((a, b) => b[1] - a[1]));

				var retStr = "**Games DGC Members Are Playing**";
				sortedGamesPlayed.forEach(function(value, key) {
					if(value > 1 || gamesPlayed.size < 25) {
						retStr += "\n" + key + ": " + value;
					}
				});

				return Promise.resolve(retStr);
			//});
		}
		
	//} else {
		//return Promise.resolve("You must @mention at least 1 user to give event credit to.");
	//}
}