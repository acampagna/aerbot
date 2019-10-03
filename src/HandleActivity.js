const CoreUtil = require("./utils/Util.js");
const MemberUtil = require("./utils/MemberUtil.js");

/**
 * Main function to handle user activity. Mostly just deals with adding exp based on user actions.
 * UNFINISHED. HAS A FEW BAD BUGS. NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */

async function handleActivityNew(client, server, activity, userData) {
	if(userData) {
		let date = new Date();

		newUserData = {
			lastOnline: date,
			lastActive: date
		};

		var exp = userData.exp;
		var startLvl = userData.level;

		//give activity points
		userData.activityPoints++;
		exp = MemberUtil.calculateNewExp("activity", exp);

		//Handle Message
		if(activity.message) {
			newUserData.lastMessage = date;
			userData.messages++;
			exp = MemberUtil.calculateNewExp("message", exp);

			//Fix username
			if(activity.message.member.displayName) {
				newUserData.username = activity.message.member.displayName;
			}
		}

		//Handle Reaction
		if(activity.reaction) {
			newUserData.lastReaction = date;
			userData.reactions++;
			exp = MemberUtil.calculateNewExp("reaction", exp);
		}

		//Handle Event
		if(activity.event) {
			userData.events++;
			exp = MemberUtil.calculateNewExp("event", exp);
		}

		var member = server.members.get(userData.id);

		newUserData.exp = exp;
		newUserData.level = MemberUtil.calculateLevel(exp);

		if(newUserData.level != startLvl) {
			//Handle Leveling Up
			await client.serverModel.findById(server.id).exec().then(serverData => {
				if(serverData.botChannelId) {
					client.channels.get(serverData.botChannelId).send(member.displayName + " has leveled up to level " + newUserData.level + "!");
					MemberUtil.handleLevelRoles(userData, member, server, serverData);
				}
			});
		}

		Object.assign(userData, newUserData);

		//TODO: Fix this being a promise on newUser
		userData.save();
	}
}

function handleActivity(client, server, message, reaction, userData) {
    if (userData) {
		let date = new Date();

		newUserData = {
			lastOnline: date,
			lastActive: date
		};

		//handle exp
		var exp = userData.exp;
		var startLvl = userData.level;

		//give activity points
		userData.activityPoints++;
		exp = MemberUtil.calculateNewExp("activity", exp);

		if(message) {
			newUserData.lastMessage = date;
			userData.messages++;
			exp = MemberUtil.calculateNewExp("message", exp);

			//Fix username
			if(message.member.displayName) {
				if(message.member.displayName !== userData.username) {
					newUserData.username = message.member.displayName;
				}
			}
		}

		if(reaction) {
			newUserData.lastReaction = date;
			userData.reactions++;
			exp = MemberUtil.calculateNewExp("reaction", exp);
		}

		var member = server.members.get(userData.id);

		newUserData.exp = exp;
		newUserData.level = MemberUtil.calculateLevel(exp);

		console.log(server.id);

		if(newUserData.level > startLvl) {
			//Handle Leveling Up
			client.serverModel.findById(message.guild.id).exec()
			.then(serverData => {
				client.channels.get(serverData.botChannelId).send(member.displayName + " has leveled up to level " + newUserData.level + "!");
				MemberUtil.handleLevelRoles(userData, member, server, serverData);
			});
		}

		Object.assign(userData, newUserData);

		//TODO: Fix this being a promise on newUser
		userData.save();
	}
}

module.exports = handleActivityNew;