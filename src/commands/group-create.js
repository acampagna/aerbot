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

/**
 * Creates a group in the system. Creates the group's channel, role, entry in database. Also sets permissions for the channel.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, guildData, client }) {
	/*let newParams = new Map(
		params.join(" ").split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(p => p.trim().replace(/\"/g, "").split(":").map(m => m.trim())).map(([k, v]) => [k.toLowerCase(), v])
	);
	CoreUtil.dateLog(newParams);
	var groupName = newParams.get('name');
	var groupEmoji = newParams.get('emoji');
	var groupList = (newParams.get('list') == 'true') || true;
	//var channelName = groupEmoji + groupName;

	CoreUtil.dateLog(groupName);
	CoreUtil.dateLog(groupEmoji);
	CoreUtil.dateLog(groupList);*/

	var groupName = params.join(" ");

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
