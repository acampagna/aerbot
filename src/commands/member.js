const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Discord = require("discord.js");
const DateDiff = require("date-diff");

module.exports = new Command({
	name: "member",
	description: "Do operations on members",
	syntax: "member",
	admin: true,
	invoke
});

function invoke({ message, params, guildData, client }) {
	CoreUtil.dateLog(params);
	switch(params[0]) {
		case 'stats':
			if(!params[1]) {
				return Promise.resolve(params[1] + " is an invalid or missing parameter.");
			} else {
				return new Promise(function(resolve, reject) {
					const now = new Date();
					if(message.mentions.users.first()) {
						var memberId = message.mentions.users.first().id;
					} else {
						var memberId = params[1];
					}
					
					User.findById(memberId).exec().then(user => {
						CoreUtil.dateLog("Member Found: " + user.username);
						const embed = new Discord.RichEmbed().setTitle(`__${user.username} Stats__`);
						embed.addField("Level", `${user.level}`);
						embed.addField("Exp", `${user.exp}`);
						embed.addField("Currency (unused)", `${user.currency}`);
						embed.addField("Rank (unused)", `${user.rank}`);
						embed.addField("Class (unused)", `${user.class}`);
						embed.addField("# messages", `${user.messages}`);
						embed.addField("# reactions", `${user.reactions}`);
						embed.addField("Activity Points", `${user.activityPoints}`);
						embed.addField("Battle Royale Wins", `${user.brWins}`);
						embed.addField("Last Online", `${user.lastOnline}\n*${new DateDiff(now, user.lastOnline).days()} days ago*`);
						embed.addField("Last Message", `${user.lastMessage}\n*${new DateDiff(now, user.lastMessage).days()} days ago*`);
						embed.addField("Last Reaction", `${user.lastReaction}\n*${new DateDiff(now, user.lastReaction).days()} days ago*`);
						embed.addField("Last Active", `${user.lastActive}\n*${new DateDiff(now, user.lastActive).days()} days ago*`);
						embed.addField("Joined", `${user.joined}\n*${new DateDiff(now, user.joined).days()} days ago*`);
						resolve ({embed});
					});
				});
			}
			break;
		case 'rank':
			/*return new Promise(function(resolve, reject) {
				var memberId = message.mentions.users.first().id;
				
				User.findById(message.member.id).exec().then(user => {
					if(!params[2]) {
						resolve (`${user.username}'s ${params[0]} is ${user.rank}`);
					} else {
						user.rank = params[1];
						user.save();
						resolve (`Set ${user.username}'s ${params[0]} to ${params[1]}`);
					}
				});
			});*/
			break;
		case 'leaderboard':
			/*return new Promise(function(resolve, reject) {
				let leaderLimit = 10;
				if(CoreUtil.isNumber(params[1])) {
					leaderLimit = parseInt(params[1]);
				}

				CoreUtil.dateLog("Leader Limit: " + leaderLimit);
				
				let ret = `__User Leaderboard__\n`;
				ret += "Top " + leaderLimit + " members of all time\n\n";

				UserData.find({}, {sort: '-exp', limit: leaderLimit}).then(users => {
					
					users.forEach(user => {
						ret += `**${user.username}** - Level ${user.level} *(${user.exp})*\n`;
					});
					
					resolve(ret);
				});
			});*/
			break;
		default:
			return Promise.resolve(params[0] + " is an invalid member operation");
	}
}
