const Command = require("../Command.js");
const mongoose = require('mongoose');
const Group = mongoose.model('Group');
const User = mongoose.model('User');
const Discord = require("discord.js");

module.exports = new Command({
	name: "group-members",
	description: "Gets a list of members in a group",
	syntax: "group-members",
	admin: false,
	invoke
});

/**
 * Creates a group in the system. Creates the group's channel, role, entry in database. Also sets permissions for the channel.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
async function invoke({ message, params, serverData, client }) {
	var groupName = params.join(" ");
	const group = await Group.findGroupByName(groupName);

	if (group) { 
		let retStr = "";
		let members = await User.find( { _id: { $in : group.memberIds } }).exec();
		
		members.forEach(usr => {
			retStr += usr.username + "\n";
		});
		const embed = new Discord.RichEmbed();
		embed.setColor("BLUE");
		embed.setTitle(`__${group.name} Members__`);
		embed.setDescription(retStr);
		embed.setFooter("Type !group " + groupName + " to join this group");
		return { embed };
	} else {
		return `No group has the name __${groupName}__.`;
	}	
}