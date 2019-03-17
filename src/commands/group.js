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
async function invoke({ message, params, guildData, client }) {
	if (params.length === 0) {
		const embed = new Discord.RichEmbed();
		let desc = "";
		embed.setColor("BLUE");
		embed.setTitle(`__Groups__`)
		const groups = await Group.findAllGroups();
		groups.forEach(group => {
			//embed.addField(group.name, group.numMembers + " members", true);
			desc = desc + group.name + " - " + group.numMembers + " member" + (group.numMembers === 1 ? "s" : "") + "\n";
		});
		embed.setDescription(desc);
		embed.setFooter("Use the !group command to join a group");
		return { embed };
	}

	let groupName = params.join(" ");
	const group = await Group.findGroupByName(groupName);
	if (!group) {
		return "Group " + groupName + " doesn't exist!";
	}
	console.log(group);
	groupName = group.name;
	const role = message.guild.roles.find(role => role.name === groupName);

	if (role) {
		const memberHasRole = message.member.roles.find(role => role.name === groupName);
		if (memberHasRole) {
			message.member.removeRole(role);
			group.decrementNumMembers();
	
			return "Removed you from group " + groupName;
		} else {
			message.member.addRole(role);
			group.incrementNumMembers();
	
			return "Added you to group " + groupName;
		}
	} else {
		return "Role " + groupName + " doesn't exist!";
	}
	
}