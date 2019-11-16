const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const Achievement = mongoose.model('Achievement');
const Discord = require("discord.js");
const User = mongoose.model('User');
const HandleActivity = require("../HandleActivity");
const AchievementService = require("../services/AchievementService");

const AS = new AchievementService();

module.exports = new Command({
	name: "achievements",
	description: "Manage, Award, and View Achievements",
	syntax: "achievements",
	admin: true,
	invoke
});

/**
 * General command to set configuration. I decided to go with specific commands for this bot but I might fall back to a single config command.
 * UNFINISHED. NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1. MIGHT NEVER USE.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, serverData, client }) {
	CoreUtil.dateLog(params);

	var paramStr = params.join(" ");
	var newParams = paramStr.match(/\\?.|^$/g).reduce((p, c) => {
        if(c === '"'){
            p.quote ^= 1;
        }else if(!p.quote && c === ' '){
            p.a.push('');
        }else{
            p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
        }
        return  p;
	}, {a: ['']}).a
	
	console.log(newParams);
	console.log(newParams[0]);

	var name = newParams[1];
	var cmd = newParams[0].toLowerCase();
	var value = newParams[2] ? newParams[2] : "";

	if(cmd === "help") {
		return Promise.resolve("Only Aerfalle should use this command.");
	}
	if(cmd === "create") {
		if (name.length > 0) {
			Achievement.create({name: name, description: value, slug: CoreUtil.slugify(name)});
			return Promise.resolve("Created Achievement " + name);
		} else {
			return Promise.resolve("You must specify an achievement name");
		}
	}
	if(cmd === "award") {
		return new Promise(function(resolve, reject) {
			if (name.length > 0) {
				if (message.mentions.members.size > 0) {
					var ids = new Array();
					var nameMentions = "";
					message.mentions.members.forEach(mention => {
						ids.push(mention.id);
						nameMentions += mention + " ";
					});
					Achievement.findByName(name).then(achievement => {
						if(achievement.emoji.length > 5) {
							var emoji = client.emojis.get(achievement.emoji);
						} else {
							var emoji = achievement.emoji;
						}
			
						//console.log(achievementEmoji + " " + emoji);
			
						var niceName = emoji + " " + achievement.name;
						var botChannel = client.channels.get(serverData.botChannelId);
						//AS.setAchievementChannel(botChannel);
						//AS.setHandleActivity(HandleActivity);
						var server = client.guilds.get(message.guild.id);
		
						User.findInIds(ids).then(users => {
							users.forEach(user => {
								/*console.log(user.username + " Currency: " + achievement.currencyBonus + " EXP: " + achievement.expBonus);

								var achievements = user.getAchievements();
								achievements.push(achievement.id);
								user.achievements = achievements;
								user.currency += 10 + achievement.currencyBonus;

								HandleActivity(client,server,{achievement: achievement.expBonus},user);

								botChannel.send(user.username + " has unlocked the " + niceName + " achievement!");*/

								AS.addAchievement(user, achievement, client, server);
							});
						});

						resolve("Awarded " + niceName + " achievement to " + nameMentions);
					});
				} else {
					resolve("You must @mention at least 1 user to give " + name + " to.");
				}
			} else {
				resolve("You must specify an achievement name!");
			}
		});
	}
	return new Promise(function(resolve, reject) {
		if(name && cmd && value && name.length > 0) {
			Achievement.findByName(name).then(achievement => {
				console.log(achievement);
				switch(cmd) {
					case 'set_emoji':
						if (value.length > 0) {
							var emoji = value;
							var splitEmoji = value.split(":");
							
							if(splitEmoji.length > 1) {
								emoji = splitEmoji[2].substr(0,splitEmoji[2].length-1);
							}
							
							console.log("EMOJI: " + emoji);
							achievement.emoji = emoji;
							resolve("Set " + name + "'s Emoji to " + emoji);
						} else {
							resolve("You must add a valid emoji");
						}
						break;
					case 'add_rank':
						if (!isNaN(value)) {
							achievement.addRank(value);
							console.log(achievement);
							resolve("Added rank " + value + " to " + name);
						} else {
							resolve("You must provide a valid number");
						}
						break;
					default:
						resolve(cmd + " is an invalid achievements command");
				}
				achievement.save();
			});
		} else {
			console.log("LISTING ACHIEVEMENTS");
			const embed = new Discord.RichEmbed();
			embed.setColor("RANDOM");
			embed.setTitle(`__Achievements__`);
			embed.setFooter("Under Construction!");
			var desc = "";

			Achievement.findAll().then(achievements => {
				achievements.forEach(achievement => {
					if(achievement.active && !achievement.hidden) {
						var achievementEmoji = achievement.emoji;
						if(achievementEmoji.length > 5) {
							var emoji = client.emojis.get(achievementEmoji);
						} else {
							var emoji = achievementEmoji;
						}
	
						//console.log(achievementEmoji + " " + emoji);
	
						desc = desc + emoji + " " + achievement.name + " - " + achievement.description + "\n";
					}
				});
				embed.setDescription(desc);
				//console.log("DESC: " + desc);

				resolve ({embed});
			});
		}
	});
}
