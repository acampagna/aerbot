const CoreUtil = require("./utils/Util.js");
const MemberUtil = require("./utils/MemberUtil.js");

/**
 * Main function to handle user activity. Mostly just deals with adding exp based on user actions.
 * UNFINISHED. HAS A FEW BAD BUGS. NEEDS TO BE CLEANED UP. FROM OLD AERBOT v1.
 * @author acampagna
 * @copyright Dauntless Gaming Community 2019
 */
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

		if(newUserData.level > startLvl) {
			//Handle Leveling Up
			client.serverModel.findById(message.guild.id).exec()
			.then(serverData => {
				client.channels.get(serverData.botChannelId).send(member.displayName + " has leveled up to level " + newUserData.level + "!");
				MemberUtil.handleLevelRoles(userData, member, server, serverData);
			});
		}

		//CoreUtil.dateLog(`Registering Activity ${id} - ${newUserData}`);

		Object.assign(userData, newUserData);

		//TODO: Fix this being a promise on newUser
		userData.save();
	}
}

module.exports = handleActivity;