const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const Achievement = mongoose.model('Achievement');
const Discord = require("discord.js");
const User = mongoose.model('User');
const HandleActivity = require("../HandleActivity");
const AchievementService = require("../services/AchievementService");
const DiscordUtil = require("../utils/DiscordUtil.js");

const AS = new AchievementService();

module.exports = new Command({
	name: "acnh",
	description: "Get your Animal Crossing: New Horizons Launch Party Achievement!",
	syntax: "acnh",
	admin: false,
	invoke
});

/**
 * General command to set configuration. I decided to go with specific commands for this bot but I might fall back to a single config command.
 * UNFINISHED. NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1. MIGHT NEVER USE.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, serverData, client }) {
	return new Promise(function(resolve, reject) {
		
		/*var ids = new Array();
		ids.push(message.member.id);

		Achievement.findByName("Starting a New Leaf").then(achievement => {
			console.log(achievement);
			if(achievement.emoji.length > 5) {
				var emoji = client.emojis.get(achievement.emoji);
			} else {
				var emoji = achievement.emoji;
			}

			var niceName = emoji + " " + achievement.name;
			var server = client.guilds.get(message.guild.id);

			User.findInIds(ids).then(users => {
				users.forEach(user => {
					AS.addAchievement(user, achievement, client, server);
				});
			});

			resolve("Awarded " + niceName + " achievement to " + nameMentions);
		});*/
		resolve("The launch party is over! If you attended and need the achievement please contact Aerfalle or Deathsfew!");
	});
}
