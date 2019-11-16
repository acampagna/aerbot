const MemberUtil = require("../utils/MemberUtil.js");
const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Discord = require("discord.js");
const AchievementService = require("../services/AchievementService");

const AS = new AchievementService();

module.exports = new Command({
	name: "accounts",
	description: "Adds/Removes/Edits one of your gaming accounts",
	syntax: "accounts",
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
	return new Promise(function(resolve, reject) {
		var memberId = message.member.id;
		var forceList = false;

		if(message.mentions.users.first()) {
			memberId = message.mentions.users.first().id;
			forceList = true;
		}

		if(params[0] && !forceList) {
			var retMsg = "";

			User.findById(message.member.id).exec().then(user => {
				var accounts = user.getAccounts();

				var valid = false;

				switch(params[0].toLowerCase()) {
					case 'steam':
						if(params[1] && params[1].length > 0 && MemberUtil.validURL(params[1])) {
							valid = true;
						} else {
							retMsg += "You must supply a valid Steam profile url";
						}
						break;
					case 'epic':
						if(params[1] && params[1].length > 0) {
							valid = true;
						} else {
							retMsg += "You must supply a valid Epic display name";
						}
						break;
					case 'origin':
						if(params[1] && params[1].length > 0) {
							valid = true;
						} else {
							retMsg += "You must supply a valid Origin display name";
						}
						break;
					case 'bnet':
					case 'battle.net':
						params[0] = "bnet";
						if(params[1] && params[1].length > 0 && params[1].includes("#")) {
							valid = true;
						} else {
							retMsg += "You must supply a valid Battle.net account. Including the # and numbers.";
						}
						break;
					case 'league':
					case 'lol':
						params[0] = "lol";
						if(params[1] && params[1].length > 0) {
							valid = true;
						} else {
							retMsg += "You must supply a valid League of Legends username";
						}
						break;
					case 'activision':
						if(params[1] && params[1].length > 0) {
							valid = true;
						} else {
							retMsg += "You must supply a valid Activision account";
						}
						break;
					case 'psn':
						if(params[1] && params[1].length > 0) {
							valid = true;
						} else {
							retMsg += "You must supply a valid PSN ID";
						}
						break;
					case 'xbl':
					case 'xbox':
						params[0] = "xbox";
						if(params[1] && params[1].length > 0 && params[1].toLowerCase() !== "live") {
							valid = true;
						} else {
							retMsg += "You must supply a valid Xbox Live account";
						}
						break;
					case 'switch':
					case 'friendcode':
						params[0] = "switch";
						if(params[1] && params[1].length > 0 && params[1].includes("-")) {
							valid = true;
						} else {
							retMsg += "You must supply a valid friend code. Including the dashes.";
						}
						break;
					default:
						const embed = new Discord.RichEmbed();
						embed.setColor("GREEN");
						embed.setTitle(`__ACCOUNTS HELP__`);
						embed.setDescription("You can use the accounts commmand to help keep track of and easily share out your gaming accounts.");
						embed.addField("Valid Account Types", "steam, epic, origin, bnet, lol, psn, xbl, switch, activision");
						embed.addField("List Accounts", "`!accounts`");
						embed.addField("Add/Edit Account", "`!accounts psn DauntlessGC`");
						embed.addField("Remove Account", "`!accounts psn`");
						embed.setFooter("If you would like to get an accountType added then please talk to an Admin!");
						resolve({embed});
				}

				if(!valid) {
					console.log("!PROCESS");
					if(accounts.has(params[0]) && !params[1]) {
						accounts.delete(params[0]);
						retMsg = "Deleted " + params[0];

						user.accounts = accounts;
						user.save();
					}
				} else {
					console.log("PROCESS");
					accounts.set(params[0], params[1]);
					retMsg = "Added " + params[0] + " : " + params[1];

					user.accounts = accounts;
					AS.addAchievementByName(user, "accountant", client, client.guilds.get(message.guild.id));
					user.save();
				}
				console.log("SHOULD BE RETURNING");
				console.log(retMsg);
				
				resolve(retMsg);
			});
		} else {
			console.log(memberId);
			const embed = new Discord.RichEmbed();
			embed.setColor("GREEN");
			embed.setTitle(`__ACCOUNTS__`);
			User.findById(memberId).exec().then(user => {
				let accounts = user.getAccounts();
				for (var [key, value] of accounts) {
					if(key != "" && value != "")
						embed.addField(key, value); 
				}
				resolve ({embed});
			});
		
		}
	});
} 