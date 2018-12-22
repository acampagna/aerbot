const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const Group = mongoose.model('Group');

module.exports = new Command({
	name: "group",
	description: "Adds/Removes a group for a user",
	syntax: "group",
	admin: false,
	invoke
});

function invoke({ message, params, guildData, client }) {
	var groupName = params.join(" ").toLowerCase().trim();

	if(groupName.length === 0) {
		return new Promise(function(resolve, reject) {
			var ret = "**Groups**\n";
			Group.findAllGroups().then(groups => {
				groups.forEach(group => {
					console.log(group.name + " : " + group.numMembers + " members");
					ret = ret + group.name + " : " + group.numMembers + " members\n";
				});
				ret = ret + "Use the !group command to join a group"
				resolve(ret);
			}).catch(console.error);
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