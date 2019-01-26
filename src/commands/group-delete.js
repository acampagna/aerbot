const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const Group = mongoose.model('Group');

module.exports = new Command({
	name: "group-delete",
	description: "Deletes a group from the group system",
	syntax: "group-delete",
	admin: true,
	invoke
});

/**
 * Deletes a group from the system. Deletes the group's channel, role, entry in database.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, guildData, client }) {
	var groupName = params.join(" ");

	return new Promise(function(resolve, reject) {
		Group.findGroupByName(groupName).then(group => {
			if(group) {
				console.log(group);
				message.guild.roles.get(group.roleId).delete();
				message.guild.channels.get(group.channelId).delete();
				//message.guild.deleteRole(group.roleId);
				//message.guild.deleteChannel(group.channelId);
				Group.deleteOne({_id: group.id}).exec();

				resolve("Deleted group " + groupName);
			} else {
				resolve("Role " + groupName + " doesn't exist!");
			}
		}).catch(console.error);
	});
}
