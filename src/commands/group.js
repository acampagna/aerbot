const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const Group = mongoose.model('Group');
const Discord = require("discord.js");

module.exports = new Command({
	name: "group",
	description: "Adds/Removes a group for a user",
	syntax: "group",
	admin: false,
	invoke
});

/**
 * Lists all groups. Adds/Removes a group for a user if they specify a group by adding the group's role to them.
 * UNFINISHED. NEEDS TO BE CLEANED UP A BIT.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, guildData, client }) {
	var groupName = params.join(" ").toLowerCase().trim();

	if(groupName.length === 0) {
		return new Promise(function(resolve, reject) {
			const embed = new Discord.RichEmbed();
			var desc = "";
			embed.setColor("BLUE");
			embed.setTitle(`__Groups__`)
			Group.findAllGroups().then(groups => {
				groups.forEach(group => {
					//embed.addField(group.name, group.numMembers + " members", true);
					desc = desc + group.name + " - " + group.numMembers + " members\n";
				});
				embed.setDescription(desc);
				embed.setFooter("Use the !group command to join a group");
				resolve ({embed});
			});
		});
	} else {
		var role = message.guild.roles.find(role => role.name.toLowerCase().trim() === groupName);

		if(role) {
			if(message.member.roles.find(role => role.name.toLowerCase().trim() === groupName)) {
				message.member.removeRole(role);
				Group.findGroupByName(groupName).then(group => {
					console.log(group);
					group.decrementNumMembers();
				}).catch(console.error);
		
				return Promise.resolve("Removed you from group " + groupName);
			} else {
				message.member.addRole(role);
				Group.findGroupByName(groupName).then(group => {
					console.log(group);
					group.incrementNumMembers();
				}).catch(console.error);
		
				return Promise.resolve("Added you to group " + groupName);
			}
		} else {
			return Promise.resolve("Role " + groupName + " doesn't exist!");
		}
	}
}