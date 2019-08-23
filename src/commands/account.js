const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Discord = require("discord.js");

module.exports = new Command({
	name: "account",
	description: "Adds/Removes/Edits one of your gaming accounts",
	syntax: "account",
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
	if(params[0]) {
		switch(params[0]) {
			/*case 'steam':
				
				break;
			case 'epic':
				
				break;
			case 'bnet':
				
				break;
			case 'psn':
			
				break;
			case 'xbl':
				
				break;
			case 'switch':
				
				break;
			case 'twitch':
				
				break;*/
			default:
				return new Promise(function(resolve, reject) {
					let retMsg = "";
					User.findById(message.member.id).exec().then(user => {
						let accounts = user.getAccounts();
						if(params[1]) {
							accounts.set(params[0], params[1]);
							retMsg = "Added " + params[0] + " : " + params[1];
						} else {
							if(accounts.has(params[0])) {
								accounts.delete(params[0]);
								retMsg = "Deleted " + params[0];
							} else {
								retMsg = "Could not delete " + params[0] + ". Account doesn't exist.";
							}
						}
						user.accounts = accounts;
						user.save();
						resolve (retMsg);
					});
				});
				break;
		}
	} else {
		return new Promise(function(resolve, reject) {
			const embed = new Discord.RichEmbed();
			embed.setColor("GREEN");
			embed.setTitle(`__ACCOUNTS__`)
			User.findById(message.member.id).exec().then(user => {
				let accounts = user.getAccounts();
				for (var [key, value] of accounts) {
					if(key != "" && value != "")
						embed.addField(key, value); 
				}
				resolve ({embed});
			});
		});
	}
} 