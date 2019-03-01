const CoreUtil = require("../utils/Util.js");
const Command = require("../Command.js");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const DateDiff = require("date-diff");

module.exports = new Command({
	name: "inactive",
	description: "List all inactive members",
	syntax: "inactive",
	admin: true,
	invoke
});

/**
 * Shows who has been inactive on discord in the past x days.
 * UNFINISHED. NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
function invoke({ message, params, guildData, client }) {

	let guild = getGuild(client, message);
	let memberIds = getUserIds(guild);
	const inactiveThresholdDays = params[0];

	let q = { _id: { $in: memberIds }}

	return new Promise(function(resolve, reject) {
		User.find(q).then(docs => {
			var activeUsers = [];
			docs.forEach(doc => {
				//CoreUtil.dateLog("Found: " + doc.username);
				activeUsers.push(doc);
			});

			var inactiveUsers = getInactiveUsers(guild, activeUsers, inactiveThresholdDays);

			var inactiveMembers = [];
			var inactiveOfficers = [];
			var inactiveOther = [];

			inactiveUsers.forEach(iu => {
				if(iu.roles.get(guildData.officerRoleId))
					inactiveOfficers.push(iu);
				else if(iu.roles.get(guildData.memberRoleId))
					inactiveMembers.push(iu);
				else 
					inactiveOther.push(iu);
			});

			resolve("The following users have been inactive for more than " + inactiveThresholdDays + " days:\n" + 
				inactiveOfficers.map(iu=> "**" + iu.displayName + "**").join("\n") + "\n" +
				inactiveMembers.map(iu=> iu.displayName).join("\n")
			);
		});
	});
}

function getGuild(client, message) {
	let foundGuild;
	client.guilds.forEach(guild => {
		if(message.guild.id === guild.id) {
			CoreUtil.dateLog(`Found Guild: ` + guild.name);
			foundGuild = guild;
		}
	});
	return foundGuild;
}

function getUserIds(guild) {
	let memberIds = [];
	guild.members.forEach(member => {
		memberIds.push(member.id);
	});
	return memberIds;
}

function getInactiveUsers(guild, activeUsers, inactiveThresholdDays) {
	const now = new Date();
	CoreUtil.dateLog("guildData.inactiveThresholdDays: " + inactiveThresholdDays);
	return guild.members.filter(m => {
		var au = activeUsers.find(e => {
			return e._id === m.id;
		});

		let lastActive = now;
		if(au){	
			lastActive = au.lastActive || au.lastOnline;
		}
		return ((!au || new DateDiff(now, lastActive).days() >= inactiveThresholdDays) && m.user.bot !== true)
	});
}