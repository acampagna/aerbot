const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Discord = require("discord.js");
const HandleActivity = require("../HandleActivity");

module.exports = new Command({
	name: "pcc",
	description: "A set of commands just for Partnered Content Creators.",
	syntax: "pcc",
	admin: true,
	invoke
});

/**
 * Sets and displays accounts for a member. Currently we use a single default for setting and displaying.
 * UNFINISHED. NEEDS CLEANUP. NEEDS TO BE FINISHED.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, serverData, client }) {
	CoreUtil.dateLog(params);
	if(CoreUtil.isMemberAdmin(message, serverData) || CoreUtil.isMemberPCC(message,serverData)) {
		return new Promise(function(resolve, reject) {
			switch(params[0]) {
				case 'eng':
				case 'e':
				case 'engagement':
					if (message.mentions.members.size > 0) {
						var ids = new Array();
						var nameMentions = "";
						message.mentions.members.forEach(mention => {
							ids.push(mention.id);
							nameMentions += "**" + mention.displayName + "** ";
						});
						User.findInIds(ids).then(users => {
							users.forEach(user => {
								console.log(user.username);
								var server = client.guilds.get(message.guild.id);
								HandleActivity(client,server,{stream_engagement: true},user);
							});
						});
						resolve("Credited the following people for engaging with their stream. Each gain 10xp and 1Ð! " + nameMentions);
					} else {
						resolve("You must @mention at least 1 user to give engagement credit to.");
					}
					break;
				case 'contrib':
				case 'c':
				case 'contributors':
					if (message.mentions.members.size > 0) {
						var ids = new Array();
						var nameMentions = "";
						message.mentions.members.forEach(mention => {
							ids.push(mention.id);
							nameMentions += "**" + mention.displayName + "** ";
						});
						User.findInIds(ids).then(users => {
							users.forEach(user => {
								console.log(user.username);
								var server = client.guilds.get(message.guild.id);
								HandleActivity(client,server,{stream_contribution: true},user);
							});
						});
						resolve("Credited the following people for contributing to their stream financially. Each gain 25xp and 5Ð! " + nameMentions);
					} else {
						resolve("You must @mention at least 1 user to give engagement credit to.");
					}
					break;
				case 'mvp':
				case 'm':
				case 'mvf':
				case 'vip':
					if (message.mentions.users.first()) {
						User.byId(message.mentions.users.first().id).then(user => {
							console.log(user.username);
							var server = client.guilds.get(message.guild.id);
							HandleActivity(client,server,{stream_mvp: true},user);
						});
						resolve("Thank you " + message.mentions.users.first() + " for being the MVP of a stream! You've earned 50xp and 10Ð");
					} else {
						resolve("You must @mention a user to give mvp credit!");
					}
					break;
				case 'help':
				default:
					resolve(getHelpEmbed());
			}
		});
	} else {
		return("Only Admins and Partnered Content Creators can use these commands!");
	}

	/*if (message.mentions.users.first() && !isNaN(params[0])) {
		User.byId(message.mentions.users.first().id).then(user => {
			user.expAdjustment += parseInt(params[0]);
			user.exp += parseInt(params[0]);
			user.save();
			//console.log(user);
		});
		return Promise.resolve("Adjusted " + message.mentions.users.first() + "'s exp by " + params[0]);
	} else {
		return Promise.resolve("You must supply an exp amount and @mention a user to give bonus exp or remove exp");
	}*/
}

function getHelpEmbed() {
	const embed = new Discord.RichEmbed();
	embed.setColor("AQUA");
	embed.setTitle(`__PARTNERED CONTENT CREATOR HELP__ - Admin Only During Testing!`);
	embed.setFooter("Only DGC Partnered Content Creators can use these commands. As always, abuse of Aerbot and it's commands is prohibited!");
	embed.setDescription("Commands for Partnered Content Creators to manage and award those that engage and contribute to their content creation efforts.");
	embed.addField("eng (in testing)", "Award members engagement credit for engaging with your stream. Engaging includes chatting during your stream and following your channel.\n`!pcc eng @ref @ref @ref`");
	embed.addField("contrib (in testing)", "Award members contribution credit for contributing to your stream either financially or with a meaningful raid. Contributions include subscribing, gifting subs, giving 300+ bits, or donating $3+.\n`!pcc contrib @ref @ref @ref`");
	embed.addField("mvp (in testing)", "Recognize up to **one** member as the MVP of your stream. This is completely up to the streamer to decide.\n`!pcc mvp @ref`");

	return embed;
}