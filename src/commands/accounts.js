const MemberUtil = require("../utils/MemberUtil.js");
const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Discord = require("discord.js");
const AchievementService = require("../services/AchievementService");
const AccountService = require("../services/AccountService");

const AS = new AchievementService();
const ACTS = new AccountService();

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
					case 'generate':
						ACTS.generateAccountLists();
						break;
					case 'steam':
						if(params[1] && params[1].length > 0) {
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
					case 'playstation':
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
						if(params[1] && params[1].length >= 12 && params[1].includes("-")) {
							valid = true;
						} else {
							retMsg += "You must supply a valid friend code. Including the dashes.";
						}
						break;
					default:
						resolve(getHelpEmbed());
				}

				if(!valid) {
					console.log("!PROCESS");
					if(accounts.has(params[0]) && !params[1]) {
						accounts.delete(params[0]);
						retMsg = "Deleted " + params[0];

						user.accounts = accounts;
						user.save().then(u => {
							ACTS.generateAccountLists(params[0].toLowerCase(), user.username);
						});
					}
				} else {
					console.log("PROCESS");
					accounts.set(params[0], params[1]);

					retMsg = "Added " + params[0] + " : " + params[1];

					user.accounts = accounts;
					user.save().then(u => {
						ACTS.generateAccountLists(params[0].toLowerCase());
						AS.addAchievementByName(user, "accountant", client, client.guilds.get(message.guild.id));
					});
				}		
				resolve(retMsg);
			});
		} else {
			console.log(memberId);
			User.findById(memberId).exec().then(user => {
				let accounts = user.getAccounts();
				if(accounts.size === 0) {
					resolve (getHelpEmbed());
				} else {
					const embed = new Discord.RichEmbed();
					embed.setColor("GREEN");
					embed.setTitle(`__ACCOUNTS__`);
					for (var [key, value] of accounts) {
						if(key != "" && value != "")
							embed.addField(MemberUtil.getAccountDisplayName(key), value); 
					}
					resolve ({embed});
				}
			});
		}
	});
} 

function getHelpEmbed() {
	const embed = new Discord.RichEmbed();
	embed.setColor("GREEN");
	embed.setTitle(`__ACCOUNTS HELP__`);
	embed.setDescription("You can use the accounts commmand to help keep track of and easily share out your gaming accounts.");
	embed.addField("Valid Account Types", "steam, epic, origin, bnet, lol, psn, xbox, switch, activision\n*If you would like to get an account type added then please talk to an Admin!*");
	embed.addField("List Accounts", "`!accounts`");
	embed.addField("Add/Edit Account", "`!accounts psn DauntlessGC`");
	embed.addField("Remove Account", "`!accounts psn`");

	return embed;
}