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

	//CoreUtil.dateLog(`MembersIds: ` + memberIds);

	let q = { user_id: { $in: memberIds }}
	//let q = { user_id: "151473524974813184" };
	//CoreUtil.dateLog(q);

	return new Promise(function(resolve, reject) {
		UserData.find(q).then(docs => {
			//CoreUtil.dateLog("!Found Docs");
			var activeUsers = [];
			//var users = "";
			docs.forEach(doc => {
				//CoreUtil.dateLog("Found: " + doc.username);
				//users += doc.username + ", ";
				activeUsers.push(doc);
			});

			var inactiveUsers = getInactiveUsers(guild,activeUsers, guildData);
			//CoreUtil.dateLog(inactiveUsers);

			var inactiveMembers = [];
			var inactiveOfficers = [];
			var inactiveOther = [];

			inactiveUsers.forEach(iu => {
				if(iu.roles.get(guildData.officerRoleID))
					inactiveOfficers.push(iu);
				else if(iu.roles.get(guildData.memberRoleID))
					inactiveMembers.push(iu);
				else 
					inactiveOther.push(iu);
			});

			//CoreUtil.dateLog("Resolve: " + users);
			resolve("The following users have been inactive for more than " + guildData.inactiveThresholdDays + " days:\n" + 
				inactiveOfficers.map(iu=> "**" + iu.displayName + "**").join("\n") + "\n" +
				inactiveMembers.map(iu=> iu.displayName).join("\n") + "\n" +
				inactiveOther.map(iu=> "*" + iu.displayName + "*").join("\n")
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

function getInactiveUsers(guild, activeUsers, guildData) {
	const now = new Date();
	CoreUtil.dateLog("guildData.inactiveThresholdDays: " + guildData.inactiveThresholdDays);
	return guild.members.filter(m => {
		var au = activeUsers.find(e => {
			return e.user_id === m.id;
		});

		let lastActive = now;
		if(au){	
			lastActive = au.last_active || au.last_online;
		}
		return ((!au || new DateDiff(now, lastActive).days() >= guildData.inactiveThresholdDays) && m.user.bot !== true)
	});
}