const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const Group = mongoose.model('Group');

module.exports = new Command({
	name: "group-create",
	description: "Creates a group to the group system",
	syntax: "group-create",
	admin: true,
	invoke
});

function invoke({ message, params, guildData, client }) {
	var groupName = params.join(" ");
	CoreUtil.dateLog(groupName);
	message.guild.createRole({
		name: groupName
	})
	.then(role => {
		console.log(`Created new role with name ${role.name}`)
		message.guild.createChannel(
			groupName, 
			'text', 
			[{
				id: message.guild.id,
				deny: ['VIEW_CHANNEL']
			}, {
				id: role.id,
				allow: ['VIEW_CHANNEL']
			}]
		).then(channel => {
			channel.setParent(guildData.groupCategory);
			Group.create({guildId: message.guild.id, roleId: role.id, channelId: channel.id, name: groupName});
			console.log(`Created new channel with name ${channel.name}`)
		}).catch(console.error);
	}).catch(console.error);
	return Promise.resolve("Created Group: " + groupName);
}
